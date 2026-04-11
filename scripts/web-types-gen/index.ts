import path from 'node:path';
import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { createChecker, type MetaCheckerOptions } from 'vue-component-meta';
import ts from 'typescript';
import type { Plugin } from 'vite-plus';

type WebTypesValue = {
  type?: string;
  kind?: 'expression' | 'no-value' | 'string' | string;
};

type WebTypesAttribute = {
  name: string;
  description?: string;
  default?: string;
  value?: WebTypesValue;
};

type WebTypesEvent = {
  name: string;
  description?: string;
};

type WebTypesSlot = {
  name: string;
  description?: string;
};

type WebTypesTag = {
  name: string;
  description?: string;
  source?: {
    module?: string;
    symbol?: string;
  };
  attributes?: WebTypesAttribute[];
  events?: WebTypesEvent[];
  slots?: WebTypesSlot[];
};

type WebTypesJson = {
  $schema: string;
  framework: 'vue';
  name: string;
  version: string;
  'description-markup'?: 'markdown' | 'html' | 'plaintext';
  contributions: {
    html: {
      tags: WebTypesTag[];
    };
  };
};

export type WebTypesPluginOptions = {
  /**
   * tsconfig 路径（非常关键：vue-component-meta 依赖它来做类型解析）
   * - 会自动读取其中的 exclude 配置用于过滤文件
   */
  tsconfigPath: string;

  /**
   * 组件扫描 glob（相对项目根目录）
   * - 会自动应用 tsconfig 中的 exclude 规则
   */
  components: string | string[];

  /**
   * 输出文件路径（相对项目根目录）
   */
  outFile?: string;

  /**
   * web-types.json 的 name/version 来源：
   * - 默认从项目 package.json 读 name/version
   * - 可手动覆盖
   */
  packageName?: string;
  packageVersion?: string;

  /**
   * 生成 tag 名策略：
   * - "kebab": 统一输出 kebab-case
   * - "both": 同时输出 kebab-case 与 PascalCase（更“宽容”，但会增大体积）
   * - "as-is": 使用 meta.name 原样（不建议）
   */
  tagNameStyle?: 'kebab' | 'both' | 'as-is';

  /**
   * 透传给 vue-component-meta
   */
  checkerOptions?: MetaCheckerOptions;
};

function toKebabCase(input: string): string {
  // MyButton -> my-button, myButton -> my-button, my-button -> my-button
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

async function readPkg(root: string): Promise<{ name: string; version: string }> {
  const pkgPath = path.join(root, 'package.json');
  const raw = await fs.readFile(pkgPath, 'utf8');
  const json = JSON.parse(raw) as { name?: string; version?: string };
  return {
    name: json.name ?? 'my-lib',
    version: json.version ?? '0.0.0',
  };
}

async function readTsConfigExclude(tsconfigPath: string): Promise<string[]> {
  try {
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (configFile.error) {
      return [];
    }

    // 直接从配置对象中读取 exclude 字段
    return configFile.config.exclude ?? [];
  } catch {
    return [];
  }
}

export function webTypesFromVueComponentMeta(options: WebTypesPluginOptions): Plugin {
  const outFile = options.outFile ?? 'web-types.json';
  const tagNameStyle = options.tagNameStyle ?? 'kebab';

  return {
    name: 'vite:web-types-from-vue-component-meta',
    apply: 'build',

    async buildStart() {
      const root = process.cwd();

      const pkg = await readPkg(root);
      const libName = options.packageName ?? pkg.name;
      const libVersion = options.packageVersion ?? pkg.version;

      const tsconfigAbsPath = path.isAbsolute(options.tsconfigPath)
        ? options.tsconfigPath
        : path.join(root, options.tsconfigPath);

      const checker = createChecker(tsconfigAbsPath, options.checkerOptions ?? {}); // createChecker + getComponentMeta 用法见官方 README :contentReference[oaicite:3]{index=3}

      // 读取 tsconfig 中的 exclude 配置
      const excludePatterns = await readTsConfigExclude(tsconfigAbsPath);

      const patterns = Array.isArray(options.components) ? options.components : [options.components];
      const files = await fg(patterns, {
        cwd: root,
        absolute: true,
        onlyFiles: true,
        ignore: excludePatterns,
      });

      const tags: WebTypesTag[] = [];

      for (const file of files) {
        const meta = checker.getComponentMeta(file);

        // vue-component-meta 的 meta.name 通常来自 SFC 的组件名推导
        const baseName = meta.name || path.parse(file).name;

        const names =
          tagNameStyle === 'both'
            ? Array.from(new Set([toKebabCase(baseName), baseName]))
            : tagNameStyle === 'as-is'
              ? [baseName]
              : [toKebabCase(baseName)];

        const attributes: WebTypesAttribute[] = (meta.props ?? [])
          .filter((p) => !p.global) // 过滤全局 prop（vue-component-meta 会标注 global）:contentReference[oaicite:4]{index=4}
          .map((p) => ({
            name: p.name,
            description: p.description,
            default: p.default ?? (p.required ? undefined : '-'),
            value: {
              type: p.type ?? 'any',
              kind: 'expression',
            },
          }));

        // emits/events
        const events: WebTypesEvent[] = (meta.events ?? []).map((e: any) => ({
          name: e.name,
          description: e.description,
        }));

        // slots
        const slots: WebTypesSlot[] = (meta.slots ?? []).map((s: any) => ({
          name: s.name,
          description: s.description,
        }));

        for (const n of names) {
          tags.push({
            name: n,
            description: meta.description,
            source: {
              module: libName,
              symbol: baseName,
            },
            attributes: attributes.length ? attributes : [],
            events: events.length ? events : [],
            slots: slots.length ? slots : [],
          });
        }
      }

      const webTypes: WebTypesJson = {
        $schema: 'https://raw.githubusercontent.com/JetBrains/web-types/master/schema/web-types.json',
        framework: 'vue',
        name: libName,
        version: libVersion,
        'description-markup': 'markdown',
        contributions: {
          html: {
            tags,
          },
        },
      };

      const outAbs = path.isAbsolute(outFile) ? outFile : path.join(root, outFile);
      await fs.writeFile(outAbs, JSON.stringify(webTypes, null, 2), 'utf8');
      this.info(`web-types generated: ${path.relative(root, outAbs)} (${tags.length} tags)`);
    },
  };
}
