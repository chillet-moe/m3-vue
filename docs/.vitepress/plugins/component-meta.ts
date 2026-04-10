import path from 'node:path';
import fg from 'fast-glob';
import { createChecker, type MetaCheckerOptions } from 'vue-component-meta';

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

/** 从类型字符串提取字面量联合选项，如 `"filled" | "tonal" | "outlined"` → `['filled', 'tonal', 'outlined']` */
function parseUnionOptions(type: string): string[] | undefined {
  // 匹配引号包裹的字符串字面量联合
  const matches = type.match(/^"[^"]*"(\s*\|\s*"[^"]*")*$/);
  if (!matches) return undefined;
  return type.split('|').map((s) => s.trim().replace(/^"|"$/g, ''));
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

    const checker = createChecker(tsconfigAbsPath, options.checkerOptions ?? {
      forceUseTs: true,
      printer: { newLine: 1 },
    });

    const patterns = Array.isArray(options.components) ? options.components : [options.components];
    const files = await fg(patterns, { cwd: root, absolute: true, onlyFiles: true });

    const result: Record<string, ComponentMeta> = {};

    for (const file of files) {
      const meta = checker.getComponentMeta(file);
      const baseName = meta.name || path.parse(file).name;

      const props: PropMeta[] = (meta.props ?? [])
        .filter((p) => !p.global)
        .map((p) => ({
          name: p.name,
          type: p.type ?? 'any',
          required: p.required,
          default: p.default,
          description: p.description,
          options: parseUnionOptions(p.type ?? ''),
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
    async handleHotUpdate({ file }: { file: string }) {
      if (file.endsWith('.vue') && file.includes('/components/')) {
        await generateMeta();
        // 返回空数组，让 VitePress 自行处理 HMR
      }
    },
  };
}
