---
title: Vue 作用域边界
---

# Vue 作用域边界

Vue 有意将父组件的 scoped 样式 ID 复制到子组件的根元素上。这样父组件便能为布局设置根元素样式，但也意味着 `button` 这样的选择器可能意外依赖子组件的私有根标签。

m3-vue 在编译时使用 `@chillet/vue-scope-boundary`。0.2 版会为 SFC 中直接编写的元素添加所有权标记，并将主体包含正向 HTML 类型选择器的 scoped 选择器限制为只匹配这些自有元素。Vue 客户端和服务端运行时均保持原样。

## 边界范围

此边界有意保持狭窄：

| 父级用法                          | 父级 scoped 选择器 | 能否匹配子级根元素？ |
| --------------------------------- | ------------------ | -------------------- |
| `<Child />` 的根元素为 `<button>` | `button`           | 否                   |
| `<Child class="primary" />`       | `button.primary`   | 否                   |
| `<Child class="primary" />`       | `.primary`         | 是                   |
| `<Child id="save" />`             | `#save`            | 是                   |
| `<Child role="button" />`         | `[role='button']`  | 是                   |
| 子组件内部使用根类 `.item`        | `.item`            | 冲突时是             |

换言之，插件可防止代码意外依赖私有 HTML 标签，但**不会**隔离纯 class、ID、属性、通配符或仅伪类选择器。向组件传递 class 仍遵循 Vue 普通的属性透传行为；插件既不授予也不移除此行为。

例如：

```vue
<template>
  <button class="action">Owned button</button>
  <Button id="save" class="action" />
</template>

<style scoped>
button,
button.action {
  /* 只匹配此 SFC 中编写的 <button>。 */
  color: red;
}

.action,
#save {
  /* 保留 Vue 的正常行为，可能匹配 Button 根元素。 */
  margin-inline: 1rem;
}
</style>
```

普通 Vue scoped CSS 已会阻止 `.btn span` 匹配子组件内部的 `span`，因为该内部元素没有父级的 scope ID。0.2 版保留了这一行为，并且也会将正向 `span` 主体编译为依赖所有权标记。`.btn .label` 这样的纯 class 主体不会获得新的边界，仍可能匹配带有冲突 `.label` 类的子级根元素；它不会因此获得访问更深层子 DOM 的能力。

## m3-vue 提供的支持

m3-vue 的 Vite、测试、包构建和文档流水线均启用了 0.2 编译器集成。通过这些流水线编译的 scoped SFC 样式会获得类型选择器边界，且无需运行时依赖。

m3-vue 的大多数组件样式以普通非 scoped CSS 发布。插件不会将这些样式变为隔离 CSS，也不会阻止继承或正常层叠。请使用文档说明的属性、`--md-*` token 和 `data-part` 约定定制组件。

使用 m3-vue 的应用 SFC 会单独编译。若要将边界应用于应用自身编写的选择器，该应用必须启用相同的编译器集成。

## Vite 配置

将 0.2 或更新版本与应用使用的 Vue 插件和编译器包一同安装：

```bash
pnpm add -D @chillet/vue-scope-boundary@^0.2.0 @vitejs/plugin-vue @vue/compiler-core @vue/compiler-sfc postcss
```

请使用预设，避免再创建第二个 `@vitejs/plugin-vue` 实例：

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vueScopeBoundary from '@chillet/vue-scope-boundary/vite';

export default defineConfig({
  plugins: [vueScopeBoundary()],
});
```

现有 Vue 插件选项应放在 `vue` 下：

```ts
vueScopeBoundary({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('x-'),
      },
    },
  },
});
```

框架自带 Vue 插件时，应组合其选项，而不是额外添加第二个插件。VitePress 可直接使用以下配置：

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress';
import { createScopeBoundaryVueOptions } from '@chillet/vue-scope-boundary/vite';

export default defineConfig({
  vue: createScopeBoundaryVueOptions(),
});
```

0.2 系列面向 Vue 3.5 和 Vite 8，目前未提供 Nuxt 集成。Nuxt 使用方会收到 m3-vue 预编译的标记，但在其构建启用转换前，自身 SFC 样式仍遵循 Vue 的常规语义。

## 编写规则

- 仅当主体是同一 SFC 中编写的元素时，才使用 `button`、`.toolbar > button` 或 `button.primary`。类型选择器用于界定元素所有权，不应用来设置子组件根元素样式。
- 有意设置组件透传根元素样式时，应向组件传入有意义的 class，并使用纯 class 选择器。
- Class 命名由应用负责。优先使用组件或功能前缀、BEM、CSS Modules 或其他不易冲突的方案；插件不会保护短 class 名。
- 不要依赖 m3-vue 的私有 `.m3-*` 类或根标签。布局优先使用属性、文档说明的 token 和由父组件拥有的包装元素。
- 只有文档说明的 `data-part` 约定允许深度定制时，才使用显式的 `:deep([data-part='...'])` 选择器。

有助于改进 API 或维护示例的语义化 class 仍然有用，但插件不要求使用它们，也不会将其视为授权标记。

## 限制

此集成不等同于 Shadow DOM 或通用 Light DOM 隔离。它不会阻止：

- 纯 class、ID、属性、通配符或仅伪类选择器；
- 全局或非 scoped 选择器；
- `color`、`font-family` 和自定义属性等常规继承；
- 显式的 `:deep()`、`:global()` 或 `:slotted()` 行为；
- scoped SFC 编译之外的常规层叠。

没有正向类型主体的选择器（包括 `:not(button)` 这样的负向类型测试）不会获得所有权边界。Vue 对末尾通配符和仅伪类复合选择器的既有处理方式也会保留。需要表达所有权时，优先使用具体的正向类型；有意跨组件遍历时，请使用 `:deep()`。

渲染函数和 JSX 不会自动获得所有权标记，已预编译的第三方 SFC 仍保留其构建时的语义。Fragment 根节点和 `inheritAttrs: false` 仍遵循 Vue 的常规属性透传规则。

此集成在
[`vue-scope-boundary` repository](https://github.com/chillet-moe/vue-scope-boundary).
