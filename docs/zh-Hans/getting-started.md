---
title: 开始使用
---

# 开始使用

安装此包，导入共享样式和预设，然后在应用启动时注册一次插件。

## 安装

```bash
pnpm add @chillet/m3-vue
```

## 注册插件

```ts
import { createApp } from 'vue';
import { M3VuePlugin } from '@chillet/m3-vue';
import App from './App.vue';

import '@chillet/m3-vue/style.css';
import { defaultPreset } from '@chillet/m3-vue/presets/default';

const app = createApp(App);

app.use(M3VuePlugin, { preset: defaultPreset });
app.mount('#app');
```

注册后，`v-tooltip`、`v-dropdown`、`v-dropdown-menu` 和 `v-context-menu` 可全局使用。使用插件的 `locale` 和 `messages` 选项配置[本地化](/zh-Hans/guides/localization)。

## 使用组件

```vue
<script setup lang="ts">
import { Button } from '@chillet/m3-vue';
</script>

<template>
  <Button leading-icon="favorite">按钮</Button>
</template>
```

## 选择紧凑预设或进行定制

如需完整的紧凑界面，请从 `@chillet/m3-vue/presets/compact` 导入 `compact` 并将其作为 `preset` 传入。它会应用紧凑排版、密度 `-2` 和协调一致的组件尺寸，无需逐个配置组件。

请参阅[定制](./guides/styling)了解预设覆盖方式，并查看[预设预览](./guides/presets)比较布局。

compact 使用外部字段标签。请在表单布局中安排可见标签；若字段没有可见标签，请提供无障碍名称。详见[字段布局](./guides/field-layout#标签行为)。

## 挂载 OverlayHost

使用程序化 `showDialog()` 或 `showSnackbar()` 时，请在应用根部附近渲染一个 `OverlayHost`。在后代组件中，于 setup 期间调用 `const { showDialog, showSnackbar } = useOverlays()`，之后使用 `showDialog(options)` 或 `showSnackbar(options)`。在组件外部，使用 `createOverlayService(host)` 绑定函数。host 会让这些浮层保留在应用的 Vue 上下文中，同时原生 dialog 和 popover 元素仍使用浏览器顶层。

```vue
<script setup lang="ts">
import { OverlayHost, createOverlayHost, provideOverlayHost } from '@chillet/m3-vue';
const overlays = provideOverlayHost(createOverlayHost());
</script>

<template>
  <OverlayHost :host="overlays" />
  <!-- 应用内容 -->
</template>
```

如果只在模板中声明式渲染 `Dialog` 和 `Snackbar`，则无需使用 `OverlayHost`。`M3VuePlugin` 不会自动插入宿主，因为这样会创建单独的 Vue 渲染根或修改使用方应用的根组件。

只挂载一个宿主。缺少宿主时，程序化浮层函数会拒绝执行；宿主卸载时，待处理的调用也会被拒绝。

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
