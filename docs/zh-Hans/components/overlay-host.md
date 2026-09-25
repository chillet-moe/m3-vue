---
title: OverlayHost
---

# OverlayHost

`OverlayHost` 为通过编程方式调用的对话框和 Snackbar 提供 Vue 渲染边界。

## 何时需要

应用使用以下任一函数时，必须且只能渲染一个 host：

- `showDialog()`
- `showSnackbar()`

直接在组件模板中声明 `Dialog` 或 `Snackbar` 实例时，无需使用 host。

`M3VuePlugin` 会注册库指令和状态层，但不会将 `OverlayHost` 插入应用的组件树。请在应用根部附近显式添加 host：

```vue
<script setup lang="ts">
import { OverlayHost } from '@chillet/m3-vue';
</script>

<template>
  <OverlayHost />
  <!-- Your application content -->
</template>
```

将 host 放在应用内容之前，也能确保应用启动期间可能打开覆盖层的后代 mounted 钩子可以使用它。

### Nuxt

使用 Nuxt 模块时，请将自动导入的 host 添加到 `app.vue`：

```vue
<template>
  <OverlayHost />
  <NuxtPage />
</template>
```

## 渲染与上下文

host 使用 `display: contents`，因此不会增加布局盒。Dialog 和弹出层元素仍是使用方 Vue 应用的后代，可以继承应用提供的依赖和 CSS 自定义属性。浏览器原生 API 会将它们放入顶层；`OverlayHost` 不使用 `Teleport`。

同一时间只能挂载一个 host。缺少 host 时，调用 `showDialog()` 和 `showSnackbar()` 会被拒绝。host 卸载时，尚未完成的编程调用也会被拒绝。

<AnatomyTable scope="overlay-host" />

<ApiTable component="OverlayHost" />
