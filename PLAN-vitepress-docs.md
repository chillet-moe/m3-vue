# Plan：使用 VitePress 替代 Storybook 构建文档站

> 本文件供 coding agent 执行，包含完整的文件结构、实现细节和执行顺序。

## 目标

用 VitePress 完全替代当前 Storybook，实现：

1. **组件 API 文档自动生成**（Props / Slots / Events / Expose 表格）
2. **Demo 预览 + 源码展示**（解决 Storybook 代码展示的痛点）
3. **交互式 Controls 面板**（基于 prop 类型自动生成控件，实时调整组件状态）
4. **暗色模式切换**
5. **Viewport 大小调整**
6. **自定义主题**（文档站骨架尽量直接使用组件库自身组件，而不是只给 VitePress 默认主题换色）

**不需要**：a11y 测试集成。

---

## 先决知识

### 项目技术栈

- **包管理器**：pnpm（monorepo，`pnpm-workspace.yaml`）
- **构建**：Vite 8 + tsdown
- **框架**：Vue 3.5 + TypeScript 6
- **PostCSS**：自定义函数 `--dp(value)` 和 `--translucent(color, opacity)`，由 `postcss.config.mts` 配置
- **CSS**：使用 `light-dark()` 函数、CSS 变量（`--md-sys-color-*`、`--md-sys-*`）、逻辑属性
- **类型检查**：`vue-tsc`，多个 tsconfig（`tsconfig.app.json`、`tsconfig.node.json`、`tsconfig.types.json`）
- **路径别名**：`@/` → `./src/`

### 组件库结构

- 入口：`src/index.ts`
- 组件目录：`src/components/{ComponentName}/`
  - 每个组件有：`ComponentName.vue`、`ComponentName.css`、`index.ts`、`ComponentName.stories.ts`
- 指令目录：`src/directives/{DirectiveName}/`
- 样式：`src/styles/theme.css`（入口，导入 reset / tokens / motion / shape / elevation / typography）
- 组件初始化：需调用 `initStateLayer()` 和注册 `vTooltip` 指令

### 现有 vue-component-meta 基础设施

`scripts/web-types-gen/index.ts`（232 行）已实现：
- 使用 `createChecker(tsconfigPath)` 创建 checker
- 使用 `checker.getComponentMeta(filePath)` 提取 props / events / slots
- 过滤全局 prop（`p.global`）
- 输出 `web-types.json`

### 现有 Story 模式（共 25 个 .stories.ts 文件）

1. **StoryObj**：简单组件，直接用 `args` 渲染（Button Default、Card Default）
2. **StoryFn + BaseTemplate**：需要 `v-model` 等交互的组件（Switch、Radio、CheckBox、Dialog、TextField、Select）
3. **StoryFn + EnumTemplate**：遍历某个 prop 的所有选项生成变体网格（Button Colors/Sizes/Shapes、IconButton、Card Colors）
4. **StoryFn + MultiEnumTemplate**：双重遍历，展示两个 prop 维度的组合（Button LeadingIcons）
5. **render 函数**：手写完整模板（Chip Variants、showSnackbar、vTooltip、Elevation）
6. **Title 覆盖**：`title: 'Components/Button/ButtonGroup'`、`title: 'Components/Button/IconButton'`（分组在 Button 下）、`title: 'Directives/Tooltip'`、`title: 'Functions/showSnackbar'`、`title: 'Utilities/Elevation'`

### 当前 Storybook 自定义样式

- `preview.css`（668 行）+ `manager.css`（234 行）= 902 行 CSS 覆盖
- 所有这些在迁移后**不再需要**
- 字体加载在 `.storybook/lib.css`：Google Fonts（Roboto Flex、Material Symbols Outlined、Noto Sans 等）

### 主题实现原则

- **不要把方案理解为“给 VitePress 默认主题改颜色”**。VitePress 主要负责路由、Markdown 渲染、静态构建、站点数据与搜索等基础设施。
- **文档站的站点骨架应尽量直接使用组件库组件实现**，包括但不限于：顶部导航、侧边导航、页面内操作区、分页/返回入口、暗色模式切换按钮、信息卡片、分组容器。
- `themeConfig.nav`、`themeConfig.sidebar`、`themeConfig.socialLinks` 等配置继续保留，但它们主要作为 **站点数据源**，由 `docs/.vitepress/theme/Layout.vue` 读取并用组件库组件渲染，而不是直接依赖 VitePress 默认主题 UI。
- `style.css` 主要承担 **布局胶水、排版协调、VitePress 内容区适配** 的职责；少量覆盖 VitePress 变量是允许的，但这不是主题实现的核心。

---

## 文件结构规划

```
docs/                              # VitePress 文档站根目录
├── .vitepress/
│   ├── config.ts                  # VitePress 配置
│   ├── theme/
│   │   ├── index.ts               # 自定义主题入口
│   │   ├── Layout.vue             # 自定义 Layout（顶部导航、侧边栏、暗色模式、分页等，尽量复用组件库组件）
│   │   └── style.css              # 文档站全局样式（布局胶水 + 内容区适配，不以“改默认主题变量”作为主要手段）
│   ├── components/
│   │   ├── ApiTable.vue           # 组件 API 表格（Props / Slots / Events）
│   │   ├── DemoContainer.vue      # Demo 预览 + 源码展示容器
│   │   ├── DemoIframe.vue         # iframe 容器（用于 Viewport 调整）
│   │   ├── Controls.vue           # 交互式 Controls 面板
│   │   ├── ControlItem.vue        # 单个控件（根据 prop 类型渲染对应输入）
│   │   └── ViewportToolbar.vue    # Viewport 大小选择工具栏
│   └── plugins/
│       └── component-meta.ts      # Vite 插件：构建时用 vue-component-meta 生成组件 meta
├── index.md                       # 首页
├── getting-started.md             # 起步指南
├── components/
│   ├── button.md                  # 每个组件一个 .md
│   ├── icon-button.md
│   ├── button-group.md
│   ├── card.md
│   ├── checkbox.md
│   ├── chip.md
│   ├── chip-group.md
│   ├── combobox.md
│   ├── dialog.md
│   ├── icon.md
│   ├── menu.md
│   ├── radio.md
│   ├── select.md
│   ├── slider.md
│   ├── snackbar.md
│   ├── switch.md
│   ├── text-field.md
│   └── tooltip.md
├── directives/
│   ├── tooltip.md
│   └── dropdown.md
├── functions/
│   └── show-snackbar.md
├── utilities/
│   └── elevation.md
└── demos/                         # 独立的 Demo .vue 文件
    ├── button/
    │   ├── ButtonDefault.vue
    │   ├── ButtonColors.vue
    │   ├── ButtonSizes.vue
    │   ├── ButtonShapes.vue
    │   ├── ButtonDisabled.vue
    │   ├── ButtonToggleable.vue
    │   ├── ButtonLeadingIcons.vue
    │   └── ButtonTrailingIcons.vue
    ├── dialog/
    │   ├── DialogDefault.vue
    │   └── DialogWithIcon.vue
    ├── switch/
    │   ├── SwitchDefault.vue
    │   ├── SwitchWithIcon.vue
    │   └── SwitchStates.vue
    └── ...（每个组件的每个 story 对应一个 Demo 文件）
```

---

## 分阶段执行计划

### 阶段 0：安装依赖和项目初始化

#### 0.1 安装 VitePress

```bash
pnpm add -D vitepress
```

#### 0.2 在 `package.json` 中添加脚本

```jsonc
{
  "scripts": {
    // ...existing scripts...
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

#### 0.3 更新 `wrangler.jsonc`

将 `directory` 从 `./storybook-static` 改为 `./docs/.vitepress/dist`，将 `build.command` 从 `pnpm run story:build` 改为 `pnpm run docs:build`。

#### 0.4 在 `tsconfig.node.json` 的 `include` 中添加 `docs/.vitepress/**/*.ts`（因为 VitePress 的 config.ts 和插件需要 Node 类型）

#### 0.5 创建 `tsconfig.docs.json`

```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "docs/**/*.ts",
    "docs/**/*.tsx",
    "docs/**/*.vue"
  ],
  "exclude": [
    "src/**/*.stories.ts",
    "src/**/*.test.ts"
  ]
}
```

---

### 阶段 1：VitePress 基础配置

#### 1.1 创建 `docs/.vitepress/config.ts`

```ts
import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'url';
import { componentMetaPlugin } from './plugins/component-meta';

export default defineConfig({
  title: 'M3 Vue',
  description: 'Material Design 3 components for Vue',

  // 构建输出目录（默认就是 .vitepress/dist）
  // 保持默认即可

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },
    plugins: [
      componentMetaPlugin({
        tsconfigPath: 'tsconfig.docs.json',
        components: ['src/components/**/*.vue'],
      }),
    ],
    css: {
      // 复用主项目的 PostCSS 配置
      // VitePress 会自动读取项目根目录的 postcss.config.mts
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Components', link: '/components/button' },
      { text: 'Directives', link: '/directives/tooltip' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/getting-started' },
          ],
        },
        {
          text: 'Components',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'IconButton', link: '/components/icon-button' },
            { text: 'ButtonGroup', link: '/components/button-group' },
            { text: 'Card', link: '/components/card' },
            { text: 'CheckBox', link: '/components/checkbox' },
            { text: 'Chip', link: '/components/chip' },
            { text: 'ChipGroup', link: '/components/chip-group' },
            { text: 'Combobox', link: '/components/combobox' },
            { text: 'Dialog', link: '/components/dialog' },
            { text: 'Icon', link: '/components/icon' },
            { text: 'Menu', link: '/components/menu' },
            { text: 'Radio', link: '/components/radio' },
            { text: 'Select', link: '/components/select' },
            { text: 'Slider', link: '/components/slider' },
            { text: 'Snackbar', link: '/components/snackbar' },
            { text: 'Switch', link: '/components/switch' },
            { text: 'TextField', link: '/components/text-field' },
            { text: 'Tooltip', link: '/components/tooltip' },
          ],
        },
        {
          text: 'Directives',
          items: [
            { text: 'v-tooltip', link: '/directives/tooltip' },
            { text: 'v-dropdown', link: '/directives/dropdown' },
          ],
        },
        {
          text: 'Functions',
          items: [
            { text: 'showSnackbar', link: '/functions/show-snackbar' },
          ],
        },
        {
          text: 'Utilities',
          items: [
            { text: 'Elevation', link: '/utilities/elevation' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chillet-moe/m3-vue' },
    ],
  },
});
```

**要点**：
- `resolve.alias` 复用 `@/` 别名，使 Demo 文件可以直接 import 组件库源码
- `componentMetaPlugin` 是下文第 2 阶段要实现的 Vite 插件
- PostCSS 配置（`--dp`、`--translucent`）会被 VitePress 的 Vite 实例自动读取（因为 `postcss.config.mts` 在项目根目录）
- `themeConfig` 中的导航、侧边栏、社交链接等配置项仍然保留，但后续应作为 `Layout.vue` 的数据源，由我们自己的组件进行渲染

#### 1.2 创建 `docs/.vitepress/theme/index.ts`

```ts
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import { initStateLayer, vTooltip } from '@/index';
import Layout from './Layout.vue';

import './style.css';

// 导入组件库样式
import '../../../src/styles/theme.css';

// 导入文档站专用组件
import ApiTable from '../components/ApiTable.vue';
import DemoContainer from '../components/DemoContainer.vue';
import Controls from '../components/Controls.vue';

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout),
  enhanceApp({ app }) {
    // 注册组件库需要的指令和初始化
    app.directive('tooltip', vTooltip);
    initStateLayer();

    // 注册文档站全局组件（方便在 Markdown 中直接使用）
    app.component('ApiTable', ApiTable);
    app.component('DemoContainer', DemoContainer);
    app.component('Controls', Controls);
  },
} satisfies Theme;
```

**要点**：
- `DefaultTheme` 只保留 VitePress 的基础能力与默认内容组件，不直接使用其站点壳子 UI
- 通过 `Layout: () => h(Layout)` 替换默认站点布局，顶部导航、侧边栏、暗色模式入口、页面底部导航等由 `Layout.vue` 和组件库组件实现
- `enhanceApp` 继续负责注册文档站全局组件与组件库初始化逻辑

#### 1.2.1 创建 `docs/.vitepress/theme/Layout.vue`

此文件是主题实现的核心。目标不是“把默认主题包一层”，而是**直接用组件库组件搭出文档站壳子**。

**职责**：
- 渲染站点顶部栏、品牌区、主要导航、移动端导航入口
- 渲染侧边栏目录、页面容器、底部上一页/下一页导航
- 提供暗色模式切换入口
- 在合适位置承载 VitePress 的内容区域（如 `VPContent` 或默认 Layout 的内容槽位）

**实现原则**：
- 顶部导航、操作按钮优先复用 `Button`、`IconButton`、`Tooltip`、`Card` 等现有组件
- 侧边栏列表优先使用组件库现有的列表/菜单能力；如果现有组件不完全适配，可在 `docs/.vitepress/theme/` 内编写很薄的包装层，但视觉与交互仍以组件库组件为主
- 不要求把 VitePress 默认主题的每个细节都 1:1 复刻，但信息架构要完整：导航、sidebar、outline、pager、social links、dark mode
- `themeConfig` 只负责提供结构化数据，不负责最终 UI

#### 1.3 创建 `docs/.vitepress/theme/style.css`

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght,GRAD@8..144,100..900,-200..100&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* 
 * 文档站样式主要服务于自定义 Layout 与 Markdown 内容区的衔接。
 * 可以少量覆盖 VitePress 默认变量来协调内容区，但不要把“改变量”当成主题实现主体。
 */
:root {
  /* 可保留少量变量映射，用于 VitePress 内容区、代码块、链接色协调 */
  --vp-c-brand-1: var(--md-sys-color-primary);
  --vp-c-brand-2: var(--md-sys-color-primary-container);
  --vp-c-brand-3: var(--md-sys-color-on-primary-container);

  /* 字体 */
  --vp-font-family-base: 'Roboto Flex', 'Helvetica Neue', Helvetica, sans-serif;
  --vp-font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

/* 组件 Demo 预览区域 */
.demo-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: --dp(16);
  margin-block: --dp(16);
  overflow: hidden;
}

.demo-preview {
  padding: --dp(24);
}

.demo-source {
  border-block-start: 1px solid var(--vp-c-divider);
}

.demo-source[open] summary {
  border-block-end: 1px solid var(--vp-c-divider);
}

.demo-source summary {
  padding: --dp(8) --dp(16);
  font-size: --dp(14);
  cursor: pointer;
  user-select: none;
  color: var(--vp-c-text-2);
}

.demo-source .language-vue,
.demo-source .language-html {
  margin: 0 !important;
  border-radius: 0 !important;
}
```

#### 1.4 创建 `docs/public/logo.svg`

复制 `public/logo.svg` 到 `docs/public/logo.svg`。

#### 1.5 创建 `docs/index.md`

```md
---
layout: home
hero:
  name: M3 Vue
  text: Material Design 3 for Vue
  tagline: A Vue 3 component library implementing Material Design 3
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: Components
      link: /components/button
---
```

---

### 阶段 2：组件 Meta 数据管道

#### 2.1 创建 `docs/.vitepress/plugins/component-meta.ts`

这是一个 Vite 虚拟模块插件，在开发/构建时使用 `vue-component-meta` 提取所有组件的类型信息，并通过虚拟模块 `virtual:component-meta` 暴露给前端。

```ts
import path from 'node:path';
import fg from 'fast-glob';
import { createChecker, type MetaCheckerOptions } from 'vue-component-meta';
import type { Plugin } from 'vite';

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

export function componentMetaPlugin(options: ComponentMetaPluginOptions): Plugin {
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

    resolveId(id) {
      // 支持 `virtual:component-meta` 和 `virtual:component-meta/Button` 等
      if (id === virtualModuleId || id.startsWith(virtualModuleId + '/')) {
        return '\0' + id;
      }
    },

    load(id) {
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
    async handleHotUpdate({ file }) {
      if (file.endsWith('.vue') && file.includes('/components/')) {
        await generateMeta();
        // 返回空数组，让 VitePress 自行处理 HMR
      }
    },
  };
}
```

#### 2.2 添加虚拟模块的类型声明

在 `docs/.vitepress/env.d.ts` 中：

```ts
declare module 'virtual:component-meta' {
  import type { ComponentMeta } from './plugins/component-meta';
  const meta: Record<string, ComponentMeta>;
  export default meta;
}

declare module 'virtual:component-meta/*' {
  import type { ComponentMeta } from './plugins/component-meta';
  const meta: ComponentMeta | null;
  export default meta;
}
```

---

### 阶段 3：文档站核心组件

#### 3.1 创建 `docs/.vitepress/components/ApiTable.vue`

根据 `virtual:component-meta` 的数据渲染 Props / Events / Slots 表格。

**Props**：
- `component: string` — 组件名（如 `'Button'`）

**实现要点**：
- `import allMeta from 'virtual:component-meta'`，然后 `allMeta[props.component]`
- 渲染三个 `<table>`：Props 表格、Events 表格、Slots 表格
- Props 表格列：Name、Type、Default、Required、Description
- Type 列中如果 `prop.options` 存在，渲染为 `<code>` 标签列表
- 使用 VitePress 默认主题的 CSS 变量进行样式化
- 当 meta 为空时显示提示信息

#### 3.2 创建 `docs/.vitepress/components/DemoContainer.vue`

展示组件预览 + 源码。

**Props**：
- `src: string` — 源码字符串（由 `?raw` import 提供）

**Slots**：
- `default` — 组件实际渲染

**实现要点**：
- 上半部分是 slot 区域（组件预览）
- 下半部分是可折叠的 `<details>` 元素，展示源码
- 源码使用 VitePress 内置的代码高亮（`shiki`）——在构建时由 Markdown 处理，运行时只需展示
- 但由于我们在 Vue 组件中而非 Markdown 中，需要使用 `shiki` 运行时高亮或者预处理

**源码展示方案**：
- 在 `.md` 文件中使用 Vite 的 `?raw` 后缀导入 `.vue` 文件源码
- 传给 `DemoContainer` 的 `src` prop
- 在 `DemoContainer` 内部使用 `shiki`（VitePress 已内置）做语法高亮
- 或者更简单地——用 VitePress 提供的 `<div v-html="highlighted">` + 在 setup 中调用 shiki

**最终推荐方案**（更简单）：
- **在 Markdown 中使用如下模式**：

```md
<DemoContainer>
  <ButtonDefault />

  <template #source>

  <<< ../demos/button/ButtonDefault.vue

  </template>
</DemoContainer>
```

这里利用 VitePress 的 Markdown 代码片段导入语法（`<<<`），它会在构建时被转换为高亮的 HTML 代码块。通过 slot 传入 `DemoContainer`，无需运行时高亮。

但由于 `<<<` 语法必须在 Markdown 顶层使用（不能在 Vue 组件 slot 内），所以这个方案不可行。

**实际可行方案**：创建一个自定义 Markdown 容器插件，或者在 `DemoContainer` 内部做运行时高亮。

**最终方案——`DemoContainer` 接受 `src` prop 做运行时高亮**：

```vue
<script setup>
import ButtonDefault from '../demos/button/ButtonDefault.vue';
import ButtonDefaultSrc from '../demos/button/ButtonDefault.vue?raw';
</script>

<DemoContainer :src="ButtonDefaultSrc">
  <ButtonDefault />
</DemoContainer>
```

`DemoContainer.vue` 内部使用 `shiki` 包（VitePress 依赖中已包含）进行运行时高亮：

```ts
import { ref, watchEffect } from 'vue';
import { codeToHtml } from 'shiki';

const props = defineProps<{ src: string }>();
const highlightedHtml = ref('');

watchEffect(async () => {
  highlightedHtml.value = await codeToHtml(props.src, {
    lang: 'vue',
    themes: { light: 'github-light', dark: 'github-dark' },
  });
});
```

**注意**：`shiki` 是 VitePress 的依赖，不需要额外安装。但需要确认 VitePress 的 shiki 版本兼容 `codeToHtml` API（shiki v1+ 应该没问题）。

**补充说明**：`DemoContainer` 还需要支持 **无源码** 模式（某些 demo 不需要展示代码，例如多变体网格预览）。当 `src` 未提供时，不渲染折叠的代码区域。

#### 3.3 创建 `docs/.vitepress/components/Controls.vue`

交互式 Controls 面板——这是核心功能，需要根据组件 meta 自动生成控件。

**Props**：
- `component: string` — 组件名
- `modelValue: Record<string, any>` — 当前 prop 值对象（v-model）
- `exclude?: string[]` — 排除不展示的 prop 名

**Emits**：
- `update:modelValue`

**实现要点**：

1. 从 `virtual:component-meta` 获取组件的 prop 定义
2. 对每个 prop，根据类型自动选择控件：
   - **`boolean`**（或 `type` 中包含 `boolean`）→ 渲染 `<Switch>` 组件（使用组件库自身的 Switch）
   - **字符串字面量联合**（`prop.options` 存在）→ 渲染一组 chip/按钮（使用组件库的 `<ChipGroup>` + `<Chip>`，或 `<Select>`）
   - **`string`** → 渲染 `<TextField>` 组件
   - **`number`** → 渲染 `<TextField>` 组件（type=number）或 `<Slider>`
   - **其他复杂类型** → 渲染 `<TextField>` 组件（JSON 输入）或不渲染
3. 控件的值变更时，通过 `update:modelValue` emit 新的 props 对象
4. 面板布局：垂直排列，每个 prop 一行，左侧 label + 类型标注，右侧控件

**在 Markdown 中的使用方式**：

```md
<script setup>
import { ref } from 'vue';
import { Button } from '@/components/Button';

const props = ref({
  color: 'filled',
  size: 'medium',
  shape: 'rounded',
  disabled: false,
});
</script>

<DemoContainer>
  <Button v-bind="props">Button</Button>
</DemoContainer>

<Controls component="Button" v-model="props" :exclude="['toggleable', 'href']" />
```

**`Controls.vue` 的控件类型映射伪代码**：

```ts
function getControlType(prop: PropMeta): 'switch' | 'select' | 'text' | 'number' | 'json' | 'none' {
  const type = prop.type.toLowerCase();

  if (type === 'boolean') return 'switch';
  if (type === 'boolean | undefined') return 'switch';
  if (prop.options && prop.options.length > 0) return 'select';
  if (type === 'string') return 'text';
  if (type === 'string | undefined') return 'text';
  if (type === 'number') return 'number';
  if (type === 'number | undefined') return 'number';

  // 复杂类型（函数、对象等）不展示控件
  return 'none';
}
```

#### 3.4 创建 `docs/.vitepress/components/ControlItem.vue`

单个控件渲染器。

**Props**：
- `prop: PropMeta` — prop 元数据
- `modelValue: any` — 当前值

**Emits**：
- `update:modelValue`

**实现**：根据 `getControlType(prop)` 渲染不同的组件库组件：
- `switch` → `<Switch :checked="modelValue" @update:checked="$emit('update:modelValue', $event)">`
- `select` → 使用 `<Select :options="prop.options.map(o => ({ label: o, value: o }))" ...>` 或用 `<ChipGroup>` + `<Chip variant="filter">`（后者更 M3 风格）
- `text` → `<TextField :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">`
- `number` → `<TextField type="number" ...>`

#### 3.5 创建 `docs/.vitepress/components/ViewportToolbar.vue`

Viewport 大小调整工具栏。

**功能**：
- 一行按钮/chip：`Mobile (360px)` | `Tablet (768px)` | `Desktop (1024px)` | `Full width`
- 选中后改变预览区域的 `max-width` 或用 `<iframe>` 包裹

**实现方案选择**：

**方案 A（CSS resize，简单）**：给 Demo 预览区域加 `resize: horizontal; overflow: auto`，让用户自由拖拽。同时提供预设按钮快速设定宽度。

**方案 B（iframe，完整但复杂）**：将 Demo 渲染到 `<iframe>` 中，可以精确模拟不同 viewport。但 iframe 内需要重新加载样式和组件库，复杂度高。

**推荐方案 A**：

```vue
<script setup lang="ts">
import { ref } from 'vue';

const presets = [
  { label: 'Mobile', width: '360px' },
  { label: 'Tablet', width: '768px' },
  { label: 'Desktop', width: '1024px' },
  { label: 'Full', width: '100%' },
] as const;

const currentWidth = ref<string>('100%');
</script>

<template>
  <div class="viewport-toolbar">
    <button
      v-for="preset in presets"
      :key="preset.label"
      :class="{ active: currentWidth === preset.width }"
      @click="currentWidth = preset.width"
    >
      {{ preset.label }}
    </button>
  </div>
  <div class="viewport-container" :style="{ maxInlineSize: currentWidth, resize: 'horizontal', overflow: 'auto' }">
    <slot />
  </div>
</template>
```

**但更好的做法**：不做独立的 ViewportToolbar 组件，而是把 Viewport 选择功能集成到 `DemoContainer` 中——在 DemoContainer 的工具栏区域（代码折叠按钮旁边）加上 Viewport 预设按钮。这样每个 Demo 都可以独立调整 Viewport。

**最终决定**：将 Viewport 功能集成到 `DemoContainer.vue` 中。

#### 3.6 修订 `DemoContainer.vue` 最终设计

`DemoContainer.vue` 的完整功能：
1. **预览区域**：渲染 slot 中的组件
2. **工具栏**（预览区域底部）：
   - Viewport 预设按钮（Mobile / Tablet / Desktop / Full）
   - 显示/隐藏源码的折叠按钮
3. **源码区域**（可折叠）：语法高亮的源码
4. 预览区域的宽度受 viewport 选择控制，并支持 `resize: horizontal` 拖拽

**Props**：
- `src?: string` — 源码字符串
- `viewport?: boolean` — 是否显示 viewport 工具栏（默认 `true`）

---

### 阶段 4：暗色模式

VitePress 默认主题已内置暗色模式切换（导航栏右上角的太阳/月亮按钮）。

**需要处理**：
- 暗色模式入口应放在自定义 `Layout.vue` 中，使用组件库自己的按钮/开关组件，而不是依赖 VitePress 默认主题的右上角按钮
- VitePress 的暗色模式仍可继续通过在 `<html>` 上添加 `.dark` class 来驱动
- 组件库使用 `light-dark()` CSS 函数，依赖 `color-scheme` 属性
- 需要在 `style.css` 中同步：

```css
/* VitePress 暗色模式 → 组件库 color-scheme */
html.dark {
  color-scheme: dark;
}

html:not(.dark) {
  color-scheme: light;
}
```

组件库的 `theme.css` 已经使用 `light-dark()` 来选择颜色值。只要设置了正确的 `color-scheme`，自定义 Layout 和文档中的组件都会自动切换暗色/亮色。

**在 Demo 预览区域**也需要响应暗色模式。由于 Demo 组件直接渲染在 VitePress 页面中（非 iframe），它们会自然继承 `color-scheme`，无需额外处理。

---

### 阶段 5：编写组件文档页面

#### 5.1 文档页面模板

每个组件的 `.md` 文件遵循以下结构：

```md
---
title: Button
---

# Button

简短描述。

## Demo

<script setup>
import { ref } from 'vue';
import { Button } from '@/components/Button';
import ButtonDefault from '../demos/button/ButtonDefault.vue';
import ButtonDefaultSrc from '../demos/button/ButtonDefault.vue?raw';
import ButtonColors from '../demos/button/ButtonColors.vue';
import ButtonColorsSrc from '../demos/button/ButtonColors.vue?raw';

const props = ref({
  color: 'filled',
  size: 'medium',
  shape: 'rounded',
  disabled: false,
  leadingIcon: 'favorite',
});
</script>

### Interactive

<DemoContainer>
  <Button v-bind="props">Button</Button>
</DemoContainer>

<Controls component="Button" v-model="props" :exclude="['toggleable', 'href']" />

### Default

<DemoContainer :src="ButtonDefaultSrc">
  <ButtonDefault />
</DemoContainer>

### Colors

<DemoContainer :src="ButtonColorsSrc">
  <ButtonColors />
</DemoContainer>

## API

<ApiTable component="Button" />
```

#### 5.2 Demo 文件编写规则

每个 Demo `.vue` 文件是一个独立的 SFC，包含完整可运行的示例代码：

```vue
<!-- docs/demos/button/ButtonDefault.vue -->
<script setup>
import { Button } from '@/components/Button';
</script>

<template>
  <Button color="filled" leading-icon="favorite">Button</Button>
</template>
```

```vue
<!-- docs/demos/button/ButtonColors.vue -->
<script setup>
import { Button } from '@/components/Button';

const colors = ['elevated', 'filled', 'tonal', 'outlined', 'text'] as const;
</script>

<template>
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <Button v-for="color in colors" :key="color" :color="color">
      {{ color }}
    </Button>
  </div>
</template>
```

**关键区别 vs Storybook**：Demo 文件本身就是干净的示例代码，展示给用户时就是"如何使用这个组件"。没有 Storybook 的 `argTypes`、`getArgs` 等框架概念。

#### 5.3 需要编写的 Demo 文件列表

从现有 25 个 story 文件提取，每个 export 的 story 对应一个 Demo `.vue` 文件。交互式 Controls Demo 每个组件只需一个（在 `.md` 中直接写，不需要独立文件）。

**完整列表**：

| Story 文件 | Demo 文件 |
|---|---|
| `Button.stories.ts` (Default, Colors, Sizes, Shapes, Disabled, Toggleable, LeadingIcons, TrailingIcons) | `demos/button/ButtonDefault.vue`, `ButtonColors.vue`, `ButtonSizes.vue`, `ButtonShapes.vue`, `ButtonDisabled.vue`, `ButtonToggleable.vue`, `ButtonLeadingIcons.vue`, `ButtonTrailingIcons.vue` |
| `IconButton.stories.ts` (Default, Colors, Sizes, Shapes, Widths) | `demos/icon-button/IconButtonDefault.vue`, `IconButtonColors.vue`, `IconButtonSizes.vue`, `IconButtonShapes.vue`, `IconButtonWidths.vue` |
| `ButtonGroup.stories.ts` (Default, Types, Sizes, Colors, Multiple) | `demos/button-group/ButtonGroupDefault.vue`, `ButtonGroupTypes.vue`, `ButtonGroupSizes.vue`, `ButtonGroupColors.vue`, `ButtonGroupMultiple.vue` |
| `Card.stories.ts` (Default, Colors) | `demos/card/CardDefault.vue`, `CardColors.vue` |
| `CheckBox.stories.ts` | `demos/checkbox/CheckBoxDefault.vue`, `CheckBoxStates.vue` |
| `Chip.stories.ts` (Default, States, Elevated, Variants, Group) | `demos/chip/ChipDefault.vue`, `ChipStates.vue`, `ChipElevated.vue`, `ChipVariants.vue`, `ChipGroup.vue` |
| `ChipGroup.stories.ts` | `demos/chip-group/ChipGroupDefault.vue` |
| `Combobox.stories.ts` | `demos/combobox/ComboboxDefault.vue`, ... |
| `Dialog.stories.ts` (Default, WithIcon) | `demos/dialog/DialogDefault.vue`, `DialogWithIcon.vue` |
| `showDialog.stories.ts` | `demos/dialog/ShowDialogDefault.vue` |
| `Icon.stories.ts` | `demos/icon/IconDefault.vue` |
| `Menu.stories.ts` | `demos/menu/MenuDefault.vue`, ... |
| `Radio.stories.ts` (Default, States) | `demos/radio/RadioDefault.vue`, `RadioStates.vue` |
| `Select.stories.ts` | `demos/select/SelectDefault.vue`, ... |
| `Slider.stories.ts` | `demos/slider/SliderDefault.vue`, `SliderSizes.vue`, ... |
| `Snackbar.stories.ts` | `demos/snackbar/SnackbarDefault.vue` |
| `showSnackbar.stories.ts` | `demos/snackbar/ShowSnackbarDefault.vue` |
| `Switch.stories.ts` (Default, WithIcon, States) | `demos/switch/SwitchDefault.vue`, `SwitchWithIcon.vue`, `SwitchStates.vue` |
| `TextField.stories.ts` (Default, Configurations) | `demos/text-field/TextFieldDefault.vue`, `TextFieldConfigurations.vue` |
| `Tooltip.stories.ts` | `demos/tooltip/TooltipDefault.vue` |
| `StateLayer.stories.ts` | `demos/state-layer/StateLayerDefault.vue` |
| `Elevation.stories.ts` | `demos/elevation/ElevationDefault.vue` |
| `Form.stories.ts` | `demos/form/FormDefault.vue` |
| `vTooltip.stories.ts` | `demos/directives/VTooltipDefault.vue` |
| `vDropdown.stories.ts` | `demos/directives/VDropdownDefault.vue` |

---

### 阶段 6：清理和收尾

#### 6.1 更新 `package.json` 脚本

- 保留 `story:dev` 和 `story:build`（可选择保留一段时间供对比）
- 或直接移除所有 `story:*` 脚本，替换为 `docs:*` 脚本

#### 6.2 更新 `wrangler.jsonc`

```jsonc
{
  "assets": {
    "directory": "./docs/.vitepress/dist"
  },
  "build": {
    "command": "pnpm run docs:build"
  }
}
```

#### 6.3 移除 Storybook 相关依赖（在所有功能验证通过后）

从 `package.json` 的 `devDependencies` 中移除：
- `@storybook/addon-a11y`
- `@storybook/addon-docs`
- `@storybook/addon-themes`
- `@storybook/addon-vitest`
- `@storybook/vue3-vite`
- `@vueless/storybook-dark-mode`
- `storybook`

#### 6.4 移除 Storybook 相关文件

- 删除 `.storybook/` 目录
- 删除所有 `*.stories.ts` 文件
- 删除 `src/utils/storybook.ts`
- 删除 `storybook-static/` 目录

#### 6.5 更新 tsconfig

- 从 `tsconfig.app.json` 的 `include` 中移除 `.storybook/decorator.ts` 和 `.storybook/preview.ts`
- 从 `vite.config.ts` 的 `test.projects` 中移除 storybook 相关的 vitest 项目配置

#### 6.6 运行 `pnpm run prepublishOnly` 确认组件库构建没有被影响

---

## 执行顺序总结

```
1. 安装依赖（pnpm add -D vitepress）
2. 创建基础文件结构（config.ts、theme/index.ts、theme/Layout.vue、theme/style.css）
3. 实现 component-meta Vite 插件
4. 实现 ApiTable 组件
5. 实现 DemoContainer 组件（含 Viewport 工具栏和源码展示）
6. 实现 Controls 和 ControlItem 组件
7. 编写暗色模式 CSS 同步
8. 创建 index.md 首页
9. 编写 Button 组件的完整文档（作为模板验证所有功能）
   - 创建 Button 相关 Demo .vue 文件
   - 创建 components/button.md
   - 验证：API 表格、Demo 预览、源码展示、Controls、Viewport、暗色模式
10. 逐个编写其余组件文档（按照 Button 模板）
11. 编写指令、函数、工具 文档页面
12. 更新 package.json 脚本和 wrangler.jsonc
13. 运行 `pnpm run docs:build` 验证构建
14. 运行 `pnpm run prepublishOnly` 验证组件库构建不受影响
15. 清理 Storybook 文件（确认无误后）
```

---

## 注意事项

### CSS 相关
- 使用 `--dp()` 函数转换 dp 到 rem（`1rem = 16`）
- 使用 `--translucent()` 函数给颜色加透明度
- 偏好逻辑属性（`inline-size` 而非 `width`、`block-start` 而非 `top`、`margin-inline` 而非 `margin-left/right`）
- 使用 Baseline 2025 特性

### 组件初始化
- Demo 区域需要调用 `initStateLayer()`（在 theme `enhanceApp` 中完成一次即可）
- 需注册 `v-tooltip` 指令（在 theme `enhanceApp` 中完成）

### PostCSS
- `postcss.config.mts` 在项目根目录，VitePress 的 Vite 实例会自动读取
- 如果没有自动读取，在 `docs/.vitepress/config.ts` 的 `vite.css` 中手动配置

### 虚拟模块 HMR
- 当组件的 `.vue` 文件变更时，`component-meta` 插件应重新生成 meta 数据
- 但虚拟模块的 HMR 需要手动触发——可能需要在 `handleHotUpdate` 中使用 `server.moduleGraph.invalidateModule()` + `server.ws.send({ type: 'full-reload' })`
- 开发体验可接受，因为 prop 类型不会频繁变化

### 构建产物分离
- VitePress 的构建产物在 `docs/.vitepress/dist/`
- 组件库的构建产物在 `dist/`
- 两者完全独立，互不影响

