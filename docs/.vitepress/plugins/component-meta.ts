import path from 'node:path';
import fg from 'fast-glob';
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

/** 从类型字符串提取字面量联合选项，如 `"filled" | "tonal" | undefined` → `['filled', 'tonal']` */
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

type MetaTypeObject = {
  checker?: {
    typeToString?: (type: unknown) => string;
  };
  types?: unknown[];
  value?: unknown;
};

/**
 * 从 vue-component-meta 的类型对象提取字符串字面量联合选项。
 * 支持类型别名场景（如 `MenuColor | undefined`）。
 */
function parseUnionOptionsFromTypeObject(typeObject: unknown): string[] | undefined {
  if (!typeObject || typeof typeObject !== 'object') {
    return undefined;
  }

  const pending: unknown[] = [typeObject];
  let pendingIndex = 0;
  const visited = new Set<object>();
  const options = new Set<string>();
  let hasLiteralOption = false;
  let hasWidePrimitiveLeaf = false;
  const widePrimitiveLeafSet = new Set(['string', 'number', 'boolean', 'bigint', 'symbol', 'any', 'unknown', 'object']);

  while (pendingIndex < pending.length) {
    const current = pending[pendingIndex++];
    if (!current || typeof current !== 'object') {
      continue;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const node = current as MetaTypeObject;
    if (Array.isArray(node.types) && node.types.length > 0) {
      pending.push(...node.types);
      continue;
    }

    if (typeof node.value === 'string') {
      hasLiteralOption = true;
      options.add(node.value);
      continue;
    }

    const typeText = typeof node.checker?.typeToString === 'function' ? node.checker.typeToString(current).trim() : '';
    if (typeText === 'undefined' || typeText === 'null' || typeText === 'void') {
      continue;
    }

    if (typeText && widePrimitiveLeafSet.has(typeText)) {
      hasWidePrimitiveLeaf = true;
    }
  }

  if (!hasLiteralOption || hasWidePrimitiveLeaf) {
    return undefined;
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

      const props: PropMeta[] = (meta.props ?? [])
        .filter((p) => !p.global)
        .map((p) => ({
          options: parseUnionOptionsFromTypeObject(p.getTypeObject?.()) ?? parseUnionOptions(p.type ?? ''),
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
