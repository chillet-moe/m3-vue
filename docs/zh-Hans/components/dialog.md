---
title: Dialog
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';

import DialogDefault from '../../demos/dialog/DialogDefault.vue';
import DialogDefaultSrc from '../../demos/dialog/DialogDefault.vue?raw';
import DialogWithIcon from '../../demos/dialog/DialogWithIcon.vue';
import DialogWithIconSrc from '../../demos/dialog/DialogWithIcon.vue?raw';

const props = ref({
  closeOnBackdrop: true,
  width: undefined,
});

const open = ref(false);
</script>

# Dialog

Dialog 基于原生 `<dialog>` 元素构建模态界面，并提供标题、正文、图标和操作插槽。

Dialog 中的所有操作都使用文本按钮，包括主要、确认、最终和破坏性操作。请通过清晰的文案、顺序和位置体现操作层级，不要使用填充、色调或描边容器来强调。

<DemoContainer :viewport="false">
  <Button @click="open = true">打开对话框</Button>

  <Dialog class="vp-raw" v-bind="props" v-model:open="open">
    <template #headline>删除文件？</template>
    此文件将从工作区中永久删除。
    <template #actions>
      <Button variant="text" @click="open = false">取消</Button>
      <Button variant="text" @click="open = false">删除</Button>
    </template>
  </Dialog>
</DemoContainer>

<AnatomyTable scope="dialog" />

<ApiTable component="Dialog" v-model="props" />

<StyleTokenTable component="Dialog" />

## 关闭 lifecycle

原生对话框关闭时会触发 `update:open(false)` 和 `close`。请用它们更新控制对话框开关状态的应用状态。Dialog 自身的视觉退出效果（包括背景遮罩）完成后会触发 `closed`，其返回值与 `close` 收到的原生对话框返回值相同。该事件不会等待插槽内容中的动画。若没有动画或启用了减少动态效果，`closed` 会异步触发，不依赖超时。

退出动画期间请保留插槽数据，并在 `closed` 中释放：

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue';

const open = ref(false);
const selectedItem = shallowRef<{ name: string } | null>(null);

function request关闭() {
  open.value = false;
}

function clearDialogContent() {
  selectedItem.value = null;
}
</script>

<template>
  <Dialog v-model:open="open" @closed="clearDialogContent">
    <template #headline>{{ selectedItem?.name }}</template>
    <Button variant="text" @click="request关闭">关闭</Button>
  </Dialog>
</template>
```

## 宽度

使用 `width` 属性设置对话框表面的宽度。

```vue
<Dialog width="28rem" />
```

若要通过样式表自定义宽度，请在 `Dialog` 根元素上设置 `--md-dialog-container-width`。根原生 `<dialog>` 仍保持全屏，以确保背景点击和模态定位正常工作；该 token 控制内部表面的宽度。

```vue
<Dialog class="wide-dialog" />
```

```css
.wide-dialog {
  --md-dialog-container-width: 40rem;
}
```

## 可滚动内容

内容部件可独立滚动，同时会在块轴边缘保留常见的后代元素视觉溢出。有关 Dialog 和弹出层的通用约定及其自定义 token，请参阅[可滚动内容的视觉溢出](/zh-Hans/guides/scrollable-content-visual-overflow)。

## 示例

### 默认

<DemoContainer :src="DialogDefaultSrc" :viewport="false">
  <DialogDefault />
</DemoContainer>

### 带图标

<DemoContainer :src="DialogWithIconSrc" :viewport="false">
  <DialogWithIcon />
</DemoContainer>
