---
title: showDialog
---

<script setup lang="ts">
import ShowDialogDefault from '../../demos/show-dialog/ShowDialogDefault.vue';
import ShowDialogDefaultSrc from '../../demos/show-dialog/ShowDialogDefault.vue?raw';
</script>

# showDialog

`showDialog()` 是以程序方式打开模态对话框的入口。它通过应用的 [`OverlayHost`](/zh-Hans/components/overlay-host) 渲染 `Dialog`，等待其关闭后返回对话框结果。

<DemoContainer :src="ShowDialogDefaultSrc" :viewport="false"><ShowDialogDefault /></DemoContainer>

## 前置条件

使用此函数前，请在应用根部附近渲染一个 `OverlayHost`。仅程序化浮层需要宿主；声明式 `Dialog` 实例不需要。Vue 和 Nuxt 配置请参阅 [`OverlayHost`](/zh-Hans/components/overlay-host)。

## 基本用法

```ts
import { showDialog } from '@chillet/m3-vue';

const result = await showDialog({
  headline: '删除文件？',
  content: '此操作无法撤销。',
  actions: [
    { label: '取消', value: 'cancel' },
    { label: '删除', value: 'confirm' },
  ],
});
```

Promise 会返回被点击操作的值。如果未提供显式的 `value`，则使用操作标签。所有操作都渲染为文本按钮，包括主要操作和破坏性操作。它们的层级由文案、排列顺序和位置体现，而不是通过填充、色调或描边变体强调。

## 选项

以下表格由源代码类型生成，并与 API 变更保持同步。

### ShowDialogOptions

<SourceApiTable api="showDialog" type="ShowDialogOptions" :show-signature="false" />

### DialogAction

<SourceApiTable api="showDialog" type="DialogAction" :show-signature="false" />

## 行为说明

- 在浏览器环境之外调用 `showDialog()` 会使 Promise 被拒绝。
- 未挂载 `OverlayHost` 时调用 `showDialog()` 会使 Promise 被拒绝。
- 对话框会从宿主继承应用级 provide 和 CSS 自定义属性。
- 如果操作回调抛出错误或返回被拒绝的 Promise，外层 Promise 会以该错误被拒绝。
- 原生对话框关闭时 Promise 即返回结果。清理工作仍会等待 Dialog 自身的所有退出动画（包括背景层）结束后才从宿主移除，因此不会延迟既有的结果返回时机。

手动渲染对话框并通过插槽组合内容时，请参阅 [Dialog](/zh-Hans/components/dialog)。
