---
title: Popover
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Popover } from '@/components/Popover';

import PopoverDefault from '../../demos/popover/PopoverDefault.vue';
import PopoverDefaultSrc from '../../demos/popover/PopoverDefault.vue?raw';
import PopoverControlled from '../../demos/popover/PopoverControlled.vue';
import PopoverControlledSrc from '../../demos/popover/PopoverControlled.vue?raw';

const props = ref({
  popover: 'auto',
  placement: 'bottom-start',
  matchAnchorWidth: false,
});

const previewOpen = ref(false);
const previewAnchor = ref<HTMLElement>();
</script>

# Popover

Popover 提供通用的锚定式顶层界面，用于展示非菜单、工具提示或模态对话框的自定义内容。

Popover 是可选组件。需要具有简单开关行为、轻触关闭和基础定位的小型锚定面板时，可以使用它。对于更丰富的交互模式，优先选择专用组件，例如 `Menu`、`Tooltip`、`Dialog`、`DatePicker` 或 `TimePicker`；也可以直接组合使用原生 Popover API 和库的样式令牌。

<DemoContainer :viewport="false">
  <div style="padding: 2rem; min-block-size: 12rem">
    <span ref="previewAnchor" style="display: inline-flex">
      <Button variant="outlined" @click="previewOpen = !previewOpen">切换弹出层</Button>
    </span>
    <Popover v-bind="props" v-model:open="previewOpen" :anchor-element="previewAnchor" role="dialog" aria-label="弹出层预览">
      <div style="display: grid; gap: 0.5rem; min-inline-size: 12rem">
        <strong>弹出层内容</strong>
        <span style="color: var(--md-sys-color-on-surface-variant)">可用于轻量级锚定面板。</span>
      </div>
    </Popover>
  </div>
</DemoContainer>

<AnatomyTable scope="popover" />

<ApiTable component="Popover" v-model="props" />

<StyleTokenTable component="Popover" />

## 关闭生命周期

原生弹出层关闭时会触发 `update:open(false)`。之后的 `closed` 事件会等待 Popover 自身的退出动画结束，但不会等待插槽内容内部的动画。关闭期间请保留插槽内容，并在 `closed` 中释放。

## 示例

### 默认

<DemoContainer :src="PopoverDefaultSrc" :viewport="false">
  <PopoverDefault />
</DemoContainer>

### 受控模式

<DemoContainer :src="PopoverControlledSrc" :viewport="false">
  <PopoverControlled />
</DemoContainer>
