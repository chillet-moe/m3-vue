---
title: 悬浮操作按钮菜单
---

<script setup lang="ts">
import { ref } from 'vue';
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from '@/components/FloatingActionButtonMenu';

import FloatingActionButtonMenuDefault from '../../demos/floating-action-button-menu/FloatingActionButtonMenuDefault.vue';
import FloatingActionButtonMenuDefaultSrc from '../../demos/floating-action-button-menu/FloatingActionButtonMenuDefault.vue?raw';
import FloatingActionButtonMenuColors from '../../demos/floating-action-button-menu/FloatingActionButtonMenuColors.vue';
import FloatingActionButtonMenuColorsSrc from '../../demos/floating-action-button-menu/FloatingActionButtonMenuColors.vue?raw';
import FloatingActionButtonMenuSizes from '../../demos/floating-action-button-menu/FloatingActionButtonMenuSizes.vue';
import FloatingActionButtonMenuSizesSrc from '../../demos/floating-action-button-menu/FloatingActionButtonMenuSizes.vue?raw';
import FloatingActionButtonMenuAlignment from '../../demos/floating-action-button-menu/FloatingActionButtonMenuAlignment.vue';
import FloatingActionButtonMenuAlignmentSrc from '../../demos/floating-action-button-menu/FloatingActionButtonMenuAlignment.vue?raw';
import FloatingActionButtonMenuControlled from '../../demos/floating-action-button-menu/FloatingActionButtonMenuControlled.vue';
import FloatingActionButtonMenuControlledSrc from '../../demos/floating-action-button-menu/FloatingActionButtonMenuControlled.vue?raw';

const props = ref({
  open: false,
  color: 'primary',
  size: 'regular',
  alignment: 'end',
  icon: 'add',
  closeIcon: 'close',
  ariaLabel: '切换操作菜单',
  disabled: false,
});
</script>

# 悬浮操作按钮菜单

FAB 菜单从悬浮操作按钮展开，用于显示一组相关操作。此组件使用原生弹出层 API，实现 M3 Expressive 单尺寸菜单，并提供主色、次要色和第三层级颜色组。

<DemoContainer>
  <FloatingActionButtonMenu v-bind="props" @update:open="props.open = $event">
    <FloatingActionButtonMenuItem icon="mail">消息</FloatingActionButtonMenuItem>
    <FloatingActionButtonMenuItem icon="event">活动</FloatingActionButtonMenuItem>
    <FloatingActionButtonMenuItem icon="photo_camera">照片</FloatingActionButtonMenuItem>
  </FloatingActionButtonMenu>
</DemoContainer>

`update:open(false)` 会立即反映原生弹出层状态。若清理操作必须等到 FAB 菜单的视觉退出效果结束后再执行，请使用 `closed`。

## 示例

### 默认

<DemoContainer :src="FloatingActionButtonMenuDefaultSrc">
  <FloatingActionButtonMenuDefault />
</DemoContainer>

### 颜色

<DemoContainer :src="FloatingActionButtonMenuColorsSrc">
  <FloatingActionButtonMenuColors />
</DemoContainer>

### 尺寸

<DemoContainer :src="FloatingActionButtonMenuSizesSrc">
  <FloatingActionButtonMenuSizes />
</DemoContainer>

### 对齐与链接

<DemoContainer :src="FloatingActionButtonMenuAlignmentSrc">
  <FloatingActionButtonMenuAlignment />
</DemoContainer>

### 受控模式

<DemoContainer :src="FloatingActionButtonMenuControlledSrc">
  <FloatingActionButtonMenuControlled />
</DemoContainer>

## 参考

<AnatomyTable scope="floating-action-button-menu" />

<ApiTable component="FloatingActionButtonMenu" v-model="props" />

<StyleTokenTable component="FloatingActionButtonMenu" />
