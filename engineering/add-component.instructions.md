# 添加新组件

## 参考

https://github.com/material-components/material-components-android 这是 Material Design 3 的官方 Android 实现，一些动画效果的实现可以参考它。

https://github.com/material-components/material-components-android/tree/master/docs/components MCD 组件文档。通过读取它，并观察里面的图片和动画，可以帮助我们理解组件的设计意图和交互细节，从而更好地实现组件。

https://github.com/material-components/material-components-android/tree/master/lib/java/com/google/android/material MCD 组件源码。可以参考它的实现细节，尤其是动画实现。

## 概览

添加新组件需要修改/创建以下文件（按顺序）：

1. `src/components/<Name>/` — 组件源码
2. `src/index.ts` — 导出
3. `src/resolver.ts` — 自动导入解析器
4. `docs/components/<name>.md` — 文档页
5. `docs/demos/<name>/` — 文档 demo
6. `docs/.vitepress/config.ts` — 侧边栏导航
7. `docs/.vitepress/components/style-tokens/<ComponentName>.ts` 和 `docs/.vitepress/components/style-token-meta.ts` — 组件 public styling token metadata（如果组件暴露 styling token）

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

### 测试添加规则

是否新增测试按风险决定，不按“改了代码就必须加测试”处理：

- 新增组件、复杂交互、可访问性行为、键盘/焦点处理、状态机、表单值同步、事件派发、日期/选择器等跨组件行为，应该补测试。
- 修复 bug 时，优先补能复现该 bug 的回归测试。
- Composable 承载业务逻辑或状态推导时，优先给 composable 补测试。
- 仅修改默认值、文案、文档、简单样式 token、纯 CSS 视觉微调，通常不需要为了覆盖率额外新增测试。
- 如果现有测试已经覆盖相关行为，优先复用或微调现有测试，避免添加只断言实现细节的低价值测试。

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
- **SSR 安全的 ID 生成**：如果 composable 需要生成 DOM 可见的 ID（用于 `id`、`aria-controls` 等属性），必须在组件实例内使用 Vue 的 `useId()`，**禁止**使用模块级计数器、`Math.random()`、`Date.now()` 或 `crypto.randomUUID()`。这些非确定性方式会导致服务端和客户端生成不同的 ID，引发 SSR 水合不匹配。如果 composable 也需要在组件外使用（如测试），可以用 `getCurrentInstance()` 判断：`const id = getCurrentInstance() ? useId() : fallback`。同时应提供 `id` 选项让用户传入自定义稳定 ID

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
// Scope-boundary ownership markers for positive type selectors are injected
// globally by the Vue compiler plugin. It does not isolate class/ID/attribute
// selectors. Do not add component-specific scope inheritance options.
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

### ID 生成（SSR 安全）

组件中需要生成唯一 ID（用于 `id`、`aria-controls`、`aria-labelledby` 等属性）时，**必须使用 Vue 的 `useId()`**。绝对不要使用 `Math.random()`、`Date.now()`、`crypto.randomUUID()` 或模块级自增计数器，它们在 SSR 环境下会导致服务端与客户端生成不同值，引发水合不匹配。

```ts
import { useId } from 'vue';

const generatedId = useId();
const headlineId = `dialog-headline-${useId()}`;
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
  :where(:root) {
    /* 声明 public token 名称，不在这里提供真实默认值 */
    --md-<name>-container-color: initial;
    --md-<name>-label-color: initial;
    --md-<name>-state-layer-color: initial;
  }

  .m3-<name > {
    /* public token 是用户定制入口；private token 是组件内部实现细节 */
    --_container-color: var(--md-<name>-container-color, var(--md-sys-color-surface));
    --_label-color: var(--md-<name>-label-color, var(--md-sys-color-on-surface));
    --_state-layer-color: var(--md-<name>-state-layer-color, var(--_label-color));
  }
}

@layer components {
  /* 使用 data 属性选择器而非 CSS 类名来区分变体 */
  .m3-<name > [data-variant='filled'] {
    background: var(--_container-color);
  }

  .m3-<name > [data-disabled='true'] {
    opacity: 0.38;
    pointer-events: none;
  }
}
```

CSS 注意事项：

- 在 scoped SFC 或文档 demo 中，`button`、`button.primary` 等正向 type
  selector 只用于本 SFC 自己写出的原生元素。它们不会命中子组件根元素。
- 纯 class、ID、attribute selector 仍保留 Vue 的父 scope ID 语义。组件和
  demo 的 class 使用稳定、带上下文的命名；短 class 名需要通过 BEM、组件
  前缀或 CSS Modules 避免碰撞。
- 有意定制子组件根元素时传入语义 class 并使用纯 class selector；不要附加
  子组件的 private 根 tag 或 `.m3-*` class。访问内部部件时使用明确的
  `:deep([data-part='...'])` 契约。

- CSS token 分五层：
  - `--md-sys-*` 是主题级 token，不建议在单个组件实例上局部覆盖。
  - `--md-shape-*` 是库级语义 shape token。新增组件的容器、弹层、紧凑项、指示器等默认 shape 应优先回落到这些 token，再由它们映射到 `--md-sys-shape-corner-*`。
  - `--md-color-container`、`--md-color-on-container`、`--md-state-layer-color` 是父子组件传递语义色的上下文 token。
  - `--md-<component>-*` 是组件 public token，只暴露有明确语义的部件或稳定状态。
  - `--_*` 是组件 private token，外部不应依赖。
- 为 public token 添加低优先级 `:where(:root)` 占位声明，值使用 `initial`；真实默认值必须保留在组件 private token 的 fallback 上，避免占位声明覆盖用户定制。
- 不要完整复制 Material component token matrix。默认只为 `selected`、`unselected`、`active`、`inactive`、`error`、`disabled` 这类稳定状态暴露 public token。
- `hover`、`focus`、`pressed` 这类瞬时交互状态优先使用 `--md-state-layer-color` 和 `--md-sys-state-*-state-layer-opacity` 表达。只有组件主体颜色确实会随交互状态改变时，才增加对应 public token。
- 组件内部消费 private token，例如 `var(--_container-color)`；新的 public API 使用 `--md-<component>-*`，不要继续新增 `--md-comp-*` token。
- 如果组件暴露 public styling token，在 `docs/.vitepress/components/style-tokens/<ComponentName>.ts` 添加显式 metadata，并在 `docs/.vitepress/components/style-token-meta.ts` 注册；组件文档中使用 `<StyleTokenTable component="<ComponentName>" />` 生成 Styling 部分。
- 颜色透明度使用 `--translucent()` 函数：`color: --translucent(var(--md-sys-color-primary), 0.5);`
- Android dp 单位转换使用 `--dp()` 函数：`width: --dp(16);`（= 1rem）。仅在组件代码中使用。
- 优先使用 CSS 逻辑属性（例如 `margin-inline-start` 而非 `margin-left`）
- 尽量用 CSS 实现效果，避免 JS
- 可以使用 Baseline 2025 的平台特性
- 参考 `reference-tokens/components/` 中对应的 token CSS 文件

### 可访问性

如果 CSS 修改原生 HTML 元素不可行，可以采用：不可见的原生 HTML 元素负责功能和可访问性，自己的元素作为视觉效果。参考 CheckBox、Switch、Radio 的实现。

### Ripple 效果（m3-state-layer）

添加 `m3-state-layer` 类到指定的组件即可让其拥有水波纹效果。

`data-state-layer-hover-from` `data-state-layer-hover-target` 用于视觉区域与触发区域不一致的情况，使用方法可以参考已有的。

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

<StyleTokenTable component="<Name>" />

## Examples

### Default

<DemoContainer :src="<Name>DefaultSrc">
  <<Name>Default />
</DemoContainer>
```

关键顺序：**DemoContainer → AnatomyTable → ApiTable → StyleTokenTable → Examples**

注意事项：

- `<AnatomyTable>` 的 `scope` 值与组件模板中的 `data-scope` 一致
- `<ApiTable>` 的 `component` 值是 PascalCase 组件名
- 如果组件暴露 public styling token，添加 `<StyleTokenTable component="<Name>" />`
- `<ApiTable>` 通过 `v-model="props"` 与 DemoContainer 中的组件联动
- 如果某些 props 不适合在 ApiTable 中交互（如回调函数、数组），用 `:exclude` 排除
- md 文件中的 Vue 组件**不能包含换行**，否则会导致渲染错误
- `<DemoContainer>` 的 `:src` 属性用于显示源码，通过 `?raw` 导入
- 顶部用于联动 Props 的 `<DemoContainer>` 默认没有 `src`，会自动使用 sticky 预览；示例区带源码的 Demo 不会 sticky。组件页可以用 `:sticky="false"` 关闭，用户也可以通过文档顶部工具栏的 pin 按钮全局关闭 sticky 预览

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

### Styling metadata

组件暴露 public styling token 时，在 `docs/.vitepress/components/style-tokens/<ComponentName>.ts` 中维护显式 metadata：

```ts
import type { StyleTokenMeta } from './types';

export const nameStyleTokens = [
  {
    name: '--md-<name>-container-color',
    description: 'Controls container color.',
    fallback: 'var(--md-sys-color-surface)',
    category: 'Color',
  },
] satisfies StyleTokenMeta[];
```

`StyleTokenTable` 的 Preview 会在顶部 demo 中临时覆盖当前 token 的值，并根据 token 名称和 Anatomy 的 `data-scope` / `data-part` 自动推断预览目标。推断不足时，在单个 token 上添加 `targets`：

```ts
{
  name: '--md-<name>-container-color',
  description: 'Controls container color.',
  fallback: 'var(--md-sys-color-surface)',
  category: 'Color',
  preview: '#ff2d55',
  targets: [{ scope: '<scope-name>', part: 'container' }],
}
```

优先使用 `scope` + `part`，只在目标不是 Anatomy part 时才使用 `selector`。
如果默认预览值不合适，可以用 `preview` 指定临时值；不可视或不适合预览的 token 使用 `preview: false`。

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
vp run prepublishOnly

# 构建文档（验证 AnatomyTable、ApiTable 等是否正常）
vp run docs:build
```

---

## 检查清单

- [ ] `src/components/<Name>/` — 组件 .vue、.css、index.ts
- [ ] 模板中所有元素添加了 `data-scope` 和 `data-part`
- [ ] `src/composables/use<Name>.ts` — Composable（如适用）
- [ ] `src/index.ts` — 添加 export（组件 + composable）
- [ ] `src/resolver.ts` — `m3VueComponentNames` 中添加名称
- [ ] `docs/components/<name>.md` — 文档页（DemoContainer → AnatomyTable → ApiTable → StyleTokenTable → Examples）
- [ ] `docs/demos/<name>/` — 至少一个 Default demo
- [ ] `docs/.vitepress/config.ts` — 侧边栏添加条目
- [ ] `docs/.vitepress/components/style-tokens/<ComponentName>.ts` — public styling token metadata（如适用）
- [ ] `docs/.vitepress/components/style-token-meta.ts` — 注册 styling metadata（如适用）
- [ ] `vp run prepublishOnly` 通过
- [ ] `vp run docs:build` 通过
