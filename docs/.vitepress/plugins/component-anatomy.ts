import fs from 'node:fs';
import fg from 'fast-glob';
import { parse as parseSFC } from 'vue/compiler-sfc';
import { invalidateVirtualModuleAndReload, normalizeVitePath, type MinimalHotUpdateContext } from './hmr.ts';

export interface ComponentAnatomyPluginOptions {
  components: string | string[];
}

export interface AnatomyPart {
  part: string;
  element: string;
  conditional: boolean;
  children: AnatomyPart[];
}

export interface ComponentAnatomy {
  scope: string;
  parts: AnatomyPart[];
  tree: AnatomyPart[];
}

// Node types from @vue/compiler-core (using numeric constants to avoid import)
// @ts-ignore
const enum NodeTypes {
  ELEMENT = 1,
  ATTRIBUTE = 6,
  DIRECTIVE = 7,
  SIMPLE_EXPRESSION = 4,
}

function getStaticAttrValue(node: any, name: string): string | undefined {
  for (const prop of node.props) {
    // Static attribute: data-scope="button"
    if (prop.type === NodeTypes.ATTRIBUTE && prop.name === name) {
      return prop.value?.content;
    }

    // Dynamic binding: :data-scope="'button'" — extract string literal
    if (
      prop.type === NodeTypes.DIRECTIVE &&
      prop.name === 'bind' &&
      prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION &&
      prop.arg?.content === name
    ) {
      const expr = prop.exp;
      if (expr && expr.type === NodeTypes.SIMPLE_EXPRESSION) {
        const raw = expr.content as string;
        // Match string literals like 'button' or "button"
        const match = raw.match(/^['"](.+)['"]$/);
        if (match) {
          return match[1];
        }
      }
    }
  }

  return undefined;
}

function isConditional(node: any): boolean {
  return node.props.some(
    (prop: any) => prop.type === NodeTypes.DIRECTIVE && (prop.name === 'if' || prop.name === 'show'),
  );
}

function resolveTag(node: any): string {
  if (node.tag === 'component') {
    return 'component';
  }
  return node.tag;
}

function walkNode(
  node: any,
  parentConditional: boolean,
  results: Map<string, AnatomyPart[]>,
  currentParent: AnatomyPart | null,
): void {
  if (node.type !== NodeTypes.ELEMENT) {
    return;
  }

  const scope = getStaticAttrValue(node, 'data-scope');
  const part = getStaticAttrValue(node, 'data-part');

  if (scope && part) {
    const conditional = parentConditional || isConditional(node);
    const partNode: AnatomyPart = {
      part,
      element: resolveTag(node),
      conditional,
      children: [],
    };

    if (currentParent) {
      currentParent.children.push(partNode);
    }

    if (!results.has(scope)) {
      results.set(scope, []);
    }
    results.get(scope)!.push(partNode);

    // Continue walking children with this part as parent
    for (const child of node.children) {
      walkNode(child, false, results, partNode);
    }
    return;
  }

  // Not a data-scope/data-part element, walk children
  const cond = parentConditional || (node.tag !== 'template' && isConditional(node));
  for (const child of node.children) {
    walkNode(child, cond, results, currentParent);
  }
}

function extractAnatomy(source: string, filename: string): Map<string, ComponentAnatomy> {
  const { descriptor } = parseSFC(source, { filename });
  const templateAst = descriptor.template?.ast;

  if (!templateAst) {
    return new Map();
  }

  const scopedParts = new Map<string, AnatomyPart[]>();

  for (const child of templateAst.children) {
    walkNode(child, false, scopedParts, null);
  }

  const result = new Map<string, ComponentAnatomy>();

  for (const [scope, parts] of scopedParts) {
    // Flat list (all parts for this scope)
    const flatParts: AnatomyPart[] = [];

    function flatten(part: AnatomyPart) {
      flatParts.push({ ...part, children: [] });
      for (const child of part.children) {
        flatten(child);
      }
    }

    // Build tree: find root parts (parts that are in the top-level list)
    const tree = parts.filter((p) => p.part === 'root' || !parts.some((other) => other.children.includes(p)));

    for (const part of parts) {
      flatten(part);
    }

    // Deduplicate flat parts by part name (keep first occurrence)
    const seen = new Set<string>();
    const uniqueParts: AnatomyPart[] = [];
    for (const p of flatParts) {
      if (!seen.has(p.part)) {
        seen.add(p.part);
        uniqueParts.push(p);
      }
    }

    result.set(scope, {
      scope,
      parts: uniqueParts,
      tree,
    });
  }

  return result;
}

export function componentAnatomyPlugin(options: ComponentAnatomyPluginOptions) {
  const virtualModuleId = 'virtual:component-anatomy';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  let anatomyMap: Record<string, ComponentAnatomy> = {};

  async function generateAnatomy() {
    const root = process.cwd();
    const patterns = Array.isArray(options.components) ? options.components : [options.components];
    const files = await fg(patterns, { cwd: root, absolute: true, onlyFiles: true });

    const result: Record<string, ComponentAnatomy> = {};

    for (const file of files) {
      const source = fs.readFileSync(file, 'utf-8');
      const fileAnatomy = extractAnatomy(source, file);

      for (const [scope, anatomy] of fileAnatomy) {
        if (result[scope]) {
          // Merge parts from multiple files with same scope (e.g., Menu family)
          const existing = result[scope];
          const existingPartNames = new Set(existing.parts.map((p) => p.part));

          for (const part of anatomy.parts) {
            if (!existingPartNames.has(part.part)) {
              existing.parts.push(part);
              existingPartNames.add(part.part);
            }
          }

          // Merge tree entries too
          for (const treePart of anatomy.tree) {
            if (!existing.tree.some((t) => t.part === treePart.part)) {
              existing.tree.push(treePart);
            }
          }
        } else {
          result[scope] = anatomy;
        }
      }
    }

    anatomyMap = result;
  }

  return {
    name: 'vitepress:component-anatomy',

    async buildStart() {
      await generateAnatomy();
    },

    resolveId(id: string) {
      if (id === virtualModuleId || id.startsWith(virtualModuleId + '/')) {
        return '\0' + id;
      }
    },

    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(anatomyMap)}`;
      }

      if (id.startsWith(resolvedVirtualModuleId + '/')) {
        const scope = id.slice((resolvedVirtualModuleId + '/').length);
        const anatomy = anatomyMap[scope];
        if (anatomy) {
          return `export default ${JSON.stringify(anatomy)}`;
        }
        return `export default null`;
      }
    },

    async handleHotUpdate(ctx: MinimalHotUpdateContext) {
      const normalized = normalizeVitePath(ctx.file);
      if (normalized.endsWith('.vue') && normalized.includes('/src/components/')) {
        await generateAnatomy();
        invalidateVirtualModuleAndReload(ctx, resolvedVirtualModuleId);
        return [];
      }
    },
  };
}
