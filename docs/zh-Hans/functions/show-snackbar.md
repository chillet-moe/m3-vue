---
title: showSnackbar
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { showSnackbar } from '@/components/Snackbar';

const result = ref('');

async function openSnackbar() {
  result.value = await showSnackbar({
    message: '草稿已归档',
    action: {
      label: '撤销',
      value: 'undo',
    },
  });
}
</script>

# showSnackbar

`showSnackbar()` 是以程序方式显示短暂通知的入口。它会将 Snackbar 渲染到应用 [`OverlayHost`](/zh-Hans/components/overlay-host) 管理的共享堆栈中，等待其关闭后返回结果。

<DemoContainer :viewport="false">
  <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; padding-block: 2rem;">
    <Button @click="openSnackbar">打开 Snackbar</Button>
    <div v-if="result">结果：{{ result }}</div>
  </div>
</DemoContainer>

## 前置条件

使用此函数前，请在应用根部附近渲染一个 `OverlayHost`。仅程序化浮层需要宿主；声明式 `Snackbar` 实例不需要。Vue 和 Nuxt 配置请参阅 [`OverlayHost`](/zh-Hans/components/overlay-host)。

## 基本用法

```ts
import { showSnackbar } from '@chillet/m3-vue';

await showSnackbar({
  message: '已保存',
});
```

## 配置默认值

安装 `M3VuePlugin` 时可设置应用级默认值，这些值会应用于后续的 `showSnackbar()` 调用。支持 refs 和 getter，单次调用时传入的选项始终优先。

```ts
import { M3VuePlugin } from '@chillet/m3-vue';

app.use(M3VuePlugin, {
  snackbarDefaults: {
    dismissible: false,
    duration: 6_000,
    position: 'bottom-end',
  },
});
```

### 组件子树默认值

在祖先组件中调用 `provideSnackbarDefaults()`，再在后代组件中通过 `useSnackbar()` 捕获最近的默认值。返回的函数可在事件处理器中稍后调用。全局导入的 `showSnackbar()` 没有组件注入上下文，因此仍使用应用级默认值。

```vue
<!-- NotificationArea.vue -->
<script setup lang="ts">
import { provideSnackbarDefaults } from '@chillet/m3-vue';

provideSnackbarDefaults({
  dismissible: false,
  position: 'top-end',
});
</script>

<template>
  <slot />
</template>
```

```vue
<!-- DescendantComponent.vue -->
<script setup lang="ts">
import { useSnackbar } from '@chillet/m3-vue';

const showSnackbar = useSnackbar();

function notify() {
  void showSnackbar({ message: '已保存' });
}
</script>
```

优先级顺序为：内置默认值、应用插件默认值、最近子树默认值，最后是单次调用时传入的选项。

## 返回值

Snackbar 关闭时 Promise 会返回结果。

- 点击操作时返回 `action.value`，默认值为 `'action'`。
- 点击关闭按钮时返回 `dismissValue`，默认值为 `'dismiss'`。
- 自动超时时返回 `timeoutValue`，默认值为 `'timeout'`。

如果在浏览器环境之外调用、尚未挂载 `OverlayHost`，或 `action.onClick` 抛出错误或返回被拒绝的 Promise，则该 Promise 会被拒绝。

## 选项

以下表格由源代码类型生成，并与 API 变更保持同步。

### ShowSnackbarOptions

<SourceApiTable api="showSnackbar" type="ShowSnackbarOptions" :show-signature="false" />

### ShowSnackbarDefaults

<SourceApiTable api="showSnackbar" type="ShowSnackbarDefaults" :show-signature="false" />

### SnackbarAction

<SourceApiTable api="showSnackbar" type="SnackbarAction" :show-signature="false" />

## 行为说明

- 程序化 Snackbar 默认带有关闭按钮。设置 `dismissible: false` 可将其隐藏。
- 可以同时显示多个 Snackbar。
- 堆栈按 `position` 分开，因此顶部和底部位置互不干扰。
- Snackbar 操作从 `OverlayHost` 继承应用级 provide 和 CSS 自定义属性。
- 悬停或聚焦 Snackbar 时会暂停自动关闭计时器。
- 离开 Snackbar 后会继续剩余时间，而不是重新开始完整计时。

手动渲染 Snackbar 时，请参阅 [Snackbar](/zh-Hans/components/snackbar)。
