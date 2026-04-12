---
description: 'Use when: adding a new component, creating a new UI component, implementing a new Material Design 3 component. Covers all files that need to be created or modified.'
applyTo: 'src/components/**'
---

# 添加新组件

## 概览

添加新组件需要修改/创建以下文件（按顺序）：

1. `src/components/<Name>/` — 组件源码
2. `src/index.ts` — 导出
3. `src/resolver.ts` — 自动导入解析器
4. `docs/components/<name>.md` — 文档页
5. `docs/demos/<name>/` — 文档 demo
6. `docs/.vitepress/config.ts` — 侧边栏导航

`web-types.json` 和 `src/nuxt.ts` 会自动处理，不需要手动修改。

---

## 1. 组件源码

### 目录结构

```
src/components/<Name>/
├── <Name>.vue          # 主组件
├── <Name>.css          # 样式（独立文件，通过 <style src="..."> 引入）
├── <Name>.test.ts      # 单元测试（可选）
├── <Name>Context.ts    # Context 注入（可选，用于父子组件通信）
├── <Name>Types.ts      # 共享类型（可选，多个子组件共享时）
└── index.ts            # 导出

src/composables/
└── use<Name>.ts        # Composable（可选，见下方说明）
└── use<Name>.test.ts   # Composable 测试（可选）
```

多部件组件（如 Menu）将所有子组件放在同一目录下。

### Composable 模式（可选）

对于交互逻辑复杂的组件，可以将核心逻辑提取到 `src/composables/use<Name>.ts` 中。这样用户既可以使用开箱即用的 `.vue` 组件，也可以用 composable 搭配自定义模板实现 headless 用法。

已有 composable 的组件：`useTabs`、`useMenu`、`useSelect`。

#### Composable 文件模式

```ts
// src/composables/use<Name>.ts
import { type Ref, computed, ref } from 'vue';

export type Use<Name>Options = {
  /** 选项说明 */
  value?: MaybeRefOrGetter<string>;
};

export type Use<Name>Return = {
  /** 返回值说明 */
  value: ComputedRef<string>;
};

export function use<Name>(options: Use<Name>Options = {}): Use<Name>Return {
  // 逻辑实现...
}
```

注意事项：

- Composable 的参数使用 `MaybeRefOrGetter` 以同时支持静态值、ref 和 getter
- 返回值中的响应式状态使用 `ComputedRef` / `Ref`，方法直接暴露为函数
- Composable 不依赖 `provide` / `inject`，保持独立可测试
- 组件内使用 composable 时，**变量名不能与 `ref="..."` 模板引用同名**，否则 Vue 会将模板 ref 绑定到 composable 返回的普通对象上。例如 Menu.vue 中 `ref="menu"` 对应 `useTemplateRef('menu')`，composable 返回值应命名为 `menuActions` 而非 `menu`

### index.ts 导出模式

```ts
// 单组件
export * from './<Name>.vue';
export { default as <Name> } from './<Name>.vue';

// 如果有 Context
export * from './<Name>Context.ts';

// 多组件（如 Menu）
export * from './Menu.vue';
export * from './MenuItem.vue';
export { default as Menu } from './Menu.vue';
export { default as MenuItem } from './MenuItem.vue';
```

### .vue 文件模式

```vue
<script setup lang="ts">
// Props 类型直接在 setup 中以 export type 定义
export type <Name>Props = {
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
};

const props = withDefaults(defineProps<<Name>Props>(), {
  variant: 'filled',
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

defineSlots<{
  default(): any;
}>();
</script>

<template>
  <div
    class="m3-<name>"
    data-scope="<scope-name>"
    data-part="root"
    :data-variant="variant"
    :data-disabled="disabled ? 'true' : 'false'"
  >
    <slot />
  </div>
</template>

<style src="./<Name>.css"></style>
```

### data-scope 和 data-part

每个组件必须在模板元素上添加 `data-scope` 和 `data-part` 属性，用于提供稳定的 CSS 选择器 API。

- `data-scope`：kebab-case 的组件名，如 `button`、`text-field`、`icon-button`
- `data-part`：该元素在组件中的角色，如 `root`、`label`、`container`、`leading`、`trailing`
- 同一组件的所有内部元素共享相同的 `data-scope`
- 多部件组件的子组件可以共享父级 scope（如 MenuDivider 使用 `data-scope="menu"`），也可以有自己的 scope（如 MenuItem 使用 `data-scope="menu-item"`）
- 条件渲染的元素（`v-if`、`v-show`）也需要添加

### CSS 样式模式

```css
@import '../../styles/typography.css';

@layer tokens {
  .m3-<name > {
    /* 使用 Material Design 3 system token */
    --md-comp-<name>-container-color: var(--md-sys-color-surface);
    --md-comp-<name>-label-text-color: var(--md-sys-color-on-surface);
  }
}

/* 使用 data 属性选择器而非 CSS 类名来区分变体 */
.m3-<name > [data-variant='filled'] {
  background: var(--md-comp-<name>-container-color);
}

.m3-<name > [data-disabled='true'] {
  opacity: 0.38;
  pointer-events: none;
}
```

CSS 注意事项：

- 颜色透明度使用 `--translucent()` 函数：`color: --translucent(var(--md-sys-color-primary), 0.5);`
- Android dp 单位转换使用 `--dp()` 函数：`width: --dp(16);`（= 1rem）。仅在组件代码中使用。
- 优先使用 CSS 逻辑属性（例如 `margin-inline-start` 而非 `margin-left`）
- 尽量用 CSS 实现效果，避免 JS
- 可以使用 Baseline 2025 的平台特性
- 参考 `reference-tokens/components/` 中对应的 token CSS 文件

### 可访问性

如果 CSS 修改原生 HTML 元素不可行，可以采用：不可见的原生 HTML 元素负责功能和可访问性，自己的元素作为视觉效果。参考 CheckBox、Switch、Radio 的实现。

---

## 2. 注册导出

### src/index.ts

在 `// Components` 区域添加：

```ts
export * from './components/<Name>';
```

如果有对应的 composable，在 `// Composables` 区域添加：

```ts
export { use<Name> } from './composables/use<Name>';
export type { Use<Name>Options, Use<Name>Return } from './composables/use<Name>';
```

### src/resolver.ts

在 `m3VueComponentNames` 数组中添加组件名（PascalCase）。多部件组件的每个子组件都要添加：

```ts
export const m3VueComponentNames = [
  // ... 按字母序 ...
  '<Name>',
] as const;
```

---

## 3. 文档

### 文档页 `docs/components/<name>.md`

文件名使用 kebab-case。结构如下：

```markdown
---
title: <Name>
---

<script setup lang="ts">
import { ref } from 'vue';
import { <Name> } from '@/components/<Name>';

import <Name>Default from '../demos/<name>/<Name>Default.vue';
import <Name>DefaultSrc from '../demos/<name>/<Name>Default.vue?raw';

const props = ref({});
</script>

# <Name>

组件描述...

<DemoContainer>
  <<Name> v-bind="props">示例</<Name>>
</DemoContainer>

<AnatomyTable scope="<scope-name>" />

<ApiTable component="<Name>" v-model="props" />

## Examples

### Default

<DemoContainer :src="<Name>DefaultSrc">
  <<Name>Default />
</DemoContainer>
```

关键顺序：**DemoContainer → AnatomyTable → ApiTable → Examples**

注意事项：

- `<AnatomyTable>` 的 `scope` 值与组件模板中的 `data-scope` 一致
- `<ApiTable>` 的 `component` 值是 PascalCase 组件名
- `<ApiTable>` 通过 `v-model="props"` 与 DemoContainer 中的组件联动
- 如果某些 props 不适合在 ApiTable 中交互（如回调函数、数组），用 `:exclude` 排除
- md 文件中的 Vue 组件**不能包含换行**，否则会导致渲染错误
- `<DemoContainer>` 的 `:src` 属性用于显示源码，通过 `?raw` 导入

### Demo 文件 `docs/demos/<name>/`

目录名使用 kebab-case。每个 demo 是一个独立的 Vue SFC：

```vue
<script setup>
import { <Name> } from '@/components/<Name>';
</script>

<template>
  <<Name> variant="filled">示例</<Name>>
</template>
```

Demo 使用 `@/` 别名引入组件（而非从包名 `@chillet/m3-vue`）。

### 侧边栏 `docs/.vitepress/config.ts`

在 `text: 'Components'` 的 `items` 数组中添加条目：

```ts
{ text: '<Name>', link: '/components/<name>' },
```

---

## 4. 验证

完成所有修改后运行：

```bash
# 类型检查 + 构建库
pnpm prepublishOnly

# 构建文档（验证 AnatomyTable、ApiTable 等是否正常）
pnpm docs:build
```

---

## 检查清单

- [ ] `src/components/<Name>/` — 组件 .vue、.css、index.ts
- [ ] 模板中所有元素添加了 `data-scope` 和 `data-part`
- [ ] `src/composables/use<Name>.ts` — Composable（如适用）
- [ ] `src/index.ts` — 添加 export（组件 + composable）
- [ ] `src/resolver.ts` — `m3VueComponentNames` 中添加名称
- [ ] `docs/components/<name>.md` — 文档页（DemoContainer → AnatomyTable → ApiTable → Examples）
- [ ] `docs/demos/<name>/` — 至少一个 Default demo
- [ ] `docs/.vitepress/config.ts` — 侧边栏添加条目
- [ ] `pnpm prepublishOnly` 通过
- [ ] `pnpm docs:build` 通过
