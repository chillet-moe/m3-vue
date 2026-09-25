---
title: 开始使用
---

# 开始使用

安装此包、导入共享样式表，并在应用启动时注册一次插件。

## 安装

```bash
pnpm add @chillet/m3-vue
```

m3-vue 的构建会为 scoped SFC 样式启用 `@chillet/vue-scope-boundary`，但不会修改 Vue。为避免自定义的正向 HTML 类型选择器依赖 m3-vue 组件的私有根标签，请在使用方的 Vite 应用中启用编译器集成。Class、ID 和属性选择器会有意保留 Vue 对子组件根元素的正常行为。安装、行为和限制请参阅 [Vue Scope Boundaries](/zh-Hans/guides/vue-scope-isolation)。

## 注册插件

```ts
import { createApp } from 'vue';
import { M3VuePlugin } from '@chillet/m3-vue';
import App from './App.vue';

import '@chillet/m3-vue/style.css';

const app = createApp(App);

app.use(M3VuePlugin);
app.mount('#app');
```

注册后，`v-tooltip`、`v-dropdown`、`v-dropdown-menu` 和 `v-context-menu` 可全局使用。插件也支持响应式区域设置；详情请参阅[本地化](/zh-Hans/guides/localization)。

可通过 `snackbarDefaults` 配置程序化 Snackbar 的应用级默认值。支持 refs 和 getter，直接传给 `showSnackbar()` 的选项优先级更高。

```ts
app.use(M3VuePlugin, {
  snackbarDefaults: {
    dismissible: false,
    duration: 6_000,
  },
});
```

也可以通过同一个插件为支持形状的组件设置统一默认形状，适用于按钮、列表项、文本字段、分页链接和导航抽屉项。需要在运行时切换 `rounded` 和 `square` 时，值可以是 `ref`；显式组件属性和嵌套上下文仍具有更高优先级。

```ts
import { ref } from 'vue';

const shape = ref<'rounded' | 'square'>('square');
app.use(M3VuePlugin, { shape });

// 随后，所有支持形状的组件会一起更新。
shape.value = 'rounded';
```

## 挂载 OverlayHost

使用程序化 `showDialog()` 或 `showSnackbar()` 函数时，请在应用根部附近渲染一个 `OverlayHost`。该宿主会使这些浮层保留在应用的 Vue 上下文中，同时原生 dialog 和 popover 元素仍使用浏览器顶层。

```vue
<script setup lang="ts">
import { OverlayHost } from '@chillet/m3-vue';
</script>

<template>
  <OverlayHost />
  <!-- 应用内容 -->
</template>
```

如果只在模板中声明式渲染 `Dialog` 和 `Snackbar`，则无需使用 `OverlayHost`。`M3VuePlugin` 不会自动插入宿主，因为这样会创建单独的 Vue 渲染根或修改使用方应用的根组件。

请只挂载一个宿主。缺少宿主时，程序化浮层函数会拒绝执行；宿主卸载时，待处理的调用也会被拒绝。

## 使用组件

```vue
<script setup lang="ts">
import { Button } from '@chillet/m3-vue';
</script>

<template>
  <Button leading-icon="favorite">按钮</Button>
</template>
```

## 自动导入

如果使用 `unplugin-vue-components`，请搭配 `M3VueResolver`。

```ts
import Components from 'unplugin-vue-components/vite';
import { M3VueResolver } from '@chillet/m3-vue';

export default defineConfig({
  plugins: [
    Components({
      resolvers: [M3VueResolver()],
    }),
  ],
});
```
