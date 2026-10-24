---
title: OverlayHost
---

# OverlayHost

`OverlayHost` 会在特定应用或面板中渲染程序化调用的对话框和 Snackbar。声明式的 `Dialog` 和 `Snackbar` 组件无需使用 host。

## 设置

为每个独立拥有 UI 的 host 创建一个控制器，将它传给 `OverlayHost`，并提供给后代组件：

```vue
<script setup lang="ts">
import { createOverlayHost, provideOverlayHost, OverlayHost } from '@chillet/m3-vue';

const overlays = provideOverlayHost(createOverlayHost());
</script>

<template>
  <OverlayHost :host="overlays" />
  <ApplicationContent />
</template>
```

`provideOverlayHost()` 会通过 `useOverlays()` 和 `useSnackbar()` 将控制器提供给后代。`OverlayHost` 的默认插槽也会向后代提供其控制器。若将 host 与应用内容并列放置，请像上例一样在共同祖先中调用 `provideOverlayHost()`。Nuxt 中可在 `app.vue` 使用相同设置，并以 `NuxtPage` 作为内容。

```ts
// 在后代组件的 setup 中：
const { showDialog, showSnackbar } = useOverlays();

// 稍后在事件处理器中：
const result = await showDialog({
  headline: '保存更改？',
  actions: [{ label: '保存', value: 'save' }],
});
await showSnackbar({ message: '已保存' });
```

请在 setup 期间调用 `useOverlays()`，然后保留或解构其函数，供事件处理器和异步回调用。它的 Snackbar 函数会遵循最近的响应式 `provideSnackbarDefaults()` 配置。若只需要通知功能，仍可使用 `useSnackbar()`。

## 组件之外

在 Vue 组件之外，使用 `createOverlayService(host)` 绑定一次。返回的函数不依赖 `this` 或活动 Vue 组件：

```ts
import { createOverlayHost, createOverlayService } from '@chillet/m3-vue';

// 为每个应用或独立拥有的面板分别创建。
const host = createOverlayHost();
const { showDialog, showSnackbar } = createOverlayService(host);

// 调用任一函数前，先渲染 <OverlayHost :host="host" />。
await showDialog({ headline: '继续？' });
await showSnackbar({ message: '已保存' });
```

创建应用服务或 store 时，可将此服务传入。它可以在挂载前创建，但调用时 host 必须已挂载。它使用 host 的响应式 Snackbar 默认值，而不是组件子树的覆盖值。创建服务不会挂载 host，也不会延长 host 的生命周期。

系统不会查找当前活动窗口。插件不会自动插入 host。底层的 `showDialog(host, options)` 和 `showSnackbar(host, options)` 导出仍可用于显式的一次性调用。

## 所有权与生命周期

一个控制器同一时间只能由一个 `OverlayHost` 挂载。不同控制器可以共存于同一个 Document，也可以位于不同的同源窗口。每个 host 都拥有自己的 Snackbar 默认值和堆栈；其他应用的配置不会覆盖它们。

卸载 host 会以 `Error` 拒绝尚未完成的 Dialog 和 Snackbar Promise。host 不存在时发起的调用也会被拒绝。处置完成后才结束的操作回调无法重新打开浮层。如果 UI 可能在操作完成前消失，请处理 Promise 的拒绝。

host 使用 `display: contents`，并继承其渲染位置的 Vue provides 和 CSS 自定义属性。原生 dialog 和 popover 元素会进入浏览器顶层；host 不会通过 `Teleport` 移动内容。

已挂载的面板移动到另一个同源 Document 时，如果希望后续程序化浮层跟随面板，也应将其 host 一起移动。绑定到应用原始 host 的控制器仍会以该 host 为目标。生命周期和浏览器限制请参阅[多窗口](/zh-Hans/guides/multiple-windows)。

## 迁移

将 `<OverlayHost />` 替换为上例中的绑定控制器的 host。在后代组件中，将直接导入函数替换为：

```ts
import { useOverlays } from '@chillet/m3-vue';
const { showDialog, showSnackbar } = useOverlays();
```

现有 `showDialog(options)` 和 `showSnackbar(options)` 调用内容可以保持不变。在组件外部，则从 `createOverlayService(host)` 获取这些函数。创建并提供自身 host 的组件也应使用 `createOverlayService(host)` 执行自己的调用：Vue 注入读取祖先提供的值，不会读取同一组件 setup 中提供的值。

如果多个应用或可独立处置的面板使用同一个模块，请勿保留模块级共享控制器。应使用拥有该 UI 的实例创建控制器。

## 参考

<AnatomyTable scope="overlay-host" />

<ApiTable component="OverlayHost" />
