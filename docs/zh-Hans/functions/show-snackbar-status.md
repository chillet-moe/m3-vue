---
title: showSnackbarStatus
---

<script setup lang="ts">
import SnackbarStatusStack from '../../demos/snackbar/SnackbarStatusStack.vue';
import SnackbarStatusStackSrc from '../../demos/snackbar/SnackbarStatusStack.vue?raw';
</script>

# showSnackbarStatus

使用 `showSnackbarStatus(host, options)` 可在应用状态持续期间显示非交互式状态消息。它会与同一位置的[程序化 Snackbar](/zh-Hans/functions/show-snackbar) 共用同一个原生 popover，且位于同一个 [`OverlayHost`](/zh-Hans/components/overlay-host) 中。

<DemoContainer :src="SnackbarStatusStackSrc" :viewport="false"><SnackbarStatusStack /></DemoContainer>

先显示 Snackbar，再按任意顺序启用两条状态消息。关闭其中一条状态消息后，剩余项目会向上移动。

## 将状态消息绑定到应用状态

```ts
import { h, watch } from 'vue';
import { showSnackbarStatus } from '@chillet/m3-vue';

// host 已挂载，syncing 是布尔 ref，progress 是数值 ref。
watch(
  syncing,
  (active, _, onCleanup) => {
    if (!active) return;
    const status = showSnackbarStatus(host, {
      position: 'top-end',
      order: 0,
      render: () => h('span', { role: 'status' }, `正在同步文件 · ${progress.value}%`),
    });
    onCleanup(status.close);
  },
  { immediate: true },
);
```

`render` 可以返回文本、元素或 Vue 组件。在渲染期间读取 ref 会就地更新可见内容。请在渲染内容中指定外观和任何播报语义。内容应不可聚焦且不包含操作。指针输入会穿透到下方页面。

每次调用都会立即返回各自的句柄。状态消息会持续显示，直到调用 `close()` 或 host 卸载。重复调用 `close()` 是安全的，即使另一条状态消息已经打开也一样。未传入已挂载的浏览器 host 时，同步抛出异常。在组件的 setup 中可通过 `useOverlays()` 获取绑定到 host 的函数；组件外可使用 `createOverlayService(host)`。

## 堆叠顺序

在同一位置，状态消息显示在普通 Snackbar 上方，并按 `order` 升序排列（默认值为 `0`）。相同排序值的状态消息按出现顺序排列。普通 Snackbar 之间也保持出现顺序。在 `top-end` 位置，堆栈距离顶部和行内末端边缘 16px，项目之间间隔 8px。换行内容会按完整高度参与布局。每个位置和 host 都有各自的堆栈。

## 参考

<SourceApiTable api="showSnackbarStatus" type="ShowSnackbarStatusOptions" />

<SourceApiTable api="showSnackbarStatus" type="SnackbarStatusHandle" :show-signature="false" />
