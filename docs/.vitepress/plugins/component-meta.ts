import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import ts from 'typescript';
import { createChecker, type MetaCheckerOptions } from 'vue-component-meta';
import { invalidateVirtualModuleAndReload, normalizeVitePath, type MinimalHotUpdateContext } from './hmr';

export interface ComponentMetaPluginOptions {
  tsconfigPath: string;
  components: string | string[];
  checkerOptions?: MetaCheckerOptions;
}

export interface PropMeta {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
  /** 当 type 是联合类型字面量（如 'filled' | 'tonal'）时，解析为选项数组 */
  options?: string[];
}

export interface EventMeta {
  name: string;
  type?: string;
  description?: string;
}

export interface SlotMeta {
  name: string;
  description?: string;
  params?: string;
}

export interface ComponentMeta {
  name: string;
  description?: string;
  props: PropMeta[];
  events: EventMeta[];
  slots: SlotMeta[];
}

function parseUnionOptions(type: string): string[] | undefined {
  const parts = type
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  const optionParts = parts.filter((part) => {
    return part !== 'undefined' && part !== 'null';
  });

  if (!optionParts.length) {
    return undefined;
  }

  if (optionParts.some((part) => !/^"[^"]*"|'[^']*'$/.test(part))) {
    return undefined;
  }

  return [...new Set(optionParts.map((part) => part.slice(1, -1)))];
}

function parseStringLiteralUnionTypeNode(typeNode: ts.TypeNode): string[] | undefined {
  const nodes = ts.isUnionTypeNode(typeNode) ? typeNode.types : [typeNode];
  const options: string[] = [];

  for (const node of nodes) {
    if (!ts.isLiteralTypeNode(node) || !ts.isStringLiteral(node.literal)) {
      return undefined;
    }

    options.push(node.literal.text);
  }

  return options.length ? [...new Set(options)] : undefined;
}

function collectLocalTypeAliasOptions(file: string): Map<string, string[]> {
  const source = fs.readFileSync(file, 'utf8');
  const script = Array.from(source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g), (match) => match[1]).join('\n');
  const aliases = new Map<string, string[]>();

  if (!script) {
    return aliases;
  }

  const sourceFile = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node)) {
      const options = parseStringLiteralUnionTypeNode(node.type);

      if (options?.length) {
        aliases.set(node.name.text, options);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return aliases;
}

function parseUnionOptionsFromLocalTypeAliases(type: string, aliases: Map<string, string[]>): string[] | undefined {
  const parts = type
    .split('|')
    .map((part) => part.trim())
    .filter((part) => part && part !== 'undefined' && part !== 'null');

  if (!parts.length) {
    return undefined;
  }

  const options: string[] = [];

  for (const part of parts) {
    if (/^"[^"]*"|'[^']*'$/.test(part)) {
      options.push(part.slice(1, -1));
      continue;
    }

    const aliasOptions = aliases.get(part);

    if (!aliasOptions) {
      return undefined;
    }

    options.push(...aliasOptions);
  }

  return [...options];
}

export function componentMetaPlugin(options: ComponentMetaPluginOptions) {
  const virtualModuleId = 'virtual:component-meta';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  let metaMap: Record<string, ComponentMeta> = {};

  async function generateMeta() {
    const root = process.cwd();
    const tsconfigAbsPath = path.isAbsolute(options.tsconfigPath)
      ? options.tsconfigPath
      : path.join(root, options.tsconfigPath);

    const checker = createChecker(
      tsconfigAbsPath,
      options.checkerOptions ?? {
        forceUseTs: true,
        printer: { newLine: 1 },
      },
    );

    const patterns = Array.isArray(options.components) ? options.components : [options.components];
    const files = await fg(patterns, { cwd: root, absolute: true, onlyFiles: true });

    const result: Record<string, ComponentMeta> = {};

    for (const file of files) {
      const meta = checker.getComponentMeta(file);
      const baseName = meta.name || path.parse(file).name;
      const localTypeAliasOptions = collectLocalTypeAliasOptions(file);

      const props: PropMeta[] = (meta.props ?? [])
        .filter((p) => !p.global)
        .map((p) => ({
          options:
            parseUnionOptions(p.type ?? '') ??
            parseUnionOptionsFromLocalTypeAliases(p.type ?? '', localTypeAliasOptions),
          default: p.default,
          description: p.description,
          name: p.name,
          required: p.required,
          type: p.type ?? 'any',
        }));

      const events: EventMeta[] = (meta.events ?? []).map((e: any) => ({
        name: e.name,
        type: e.type,
        description: e.description,
      }));

      const slots: SlotMeta[] = (meta.slots ?? []).map((s: any) => ({
        name: s.name,
        description: s.description,
        params: s.params,
      }));

      result[baseName] = {
        name: baseName,
        description: meta.description,
        props,
        events,
        slots,
      };
    }

    metaMap = result;
  }

  return {
    name: 'vitepress:component-meta',

    async buildStart() {
      await generateMeta();
    },

    resolveId(id: string) {
      // 支持 `virtual:component-meta` 和 `virtual:component-meta/Button` 等
      if (id === virtualModuleId || id.startsWith(virtualModuleId + '/')) {
        return '\0' + id;
      }
    },

    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(metaMap)}`;
      }
      if (id.startsWith(resolvedVirtualModuleId + '/')) {
        const componentName = id.slice((resolvedVirtualModuleId + '/').length);
        const meta = metaMap[componentName];
        if (meta) {
          return `export default ${JSON.stringify(meta)}`;
        }
        return `export default null`;
      }
    },

    // 开发时，当 .vue 文件变化时重新生成 meta
    async handleHotUpdate(ctx: MinimalHotUpdateContext) {
      const normalized = normalizeVitePath(ctx.file);
      if ((normalized.endsWith('.vue') || normalized.endsWith('.ts')) && normalized.includes('/src/components/')) {
        await generateMeta();
        invalidateVirtualModuleAndReload(ctx, resolvedVirtualModuleId);
        return [];
      }
    },
  };
}
