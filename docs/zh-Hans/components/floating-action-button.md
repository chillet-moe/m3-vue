---
title: 悬浮操作按钮
---

<script setup lang="ts">
import { ref } from 'vue';
import { FloatingActionButton } from '@/components/FloatingActionButton';

import FloatingActionButtonDefault from '../../demos/floating-action-button/FloatingActionButtonDefault.vue';
import FloatingActionButtonDefaultSrc from '../../demos/floating-action-button/FloatingActionButtonDefault.vue?raw';
import FloatingActionButtonExtended from '../../demos/floating-action-button/FloatingActionButtonExtended.vue';
import FloatingActionButtonExtendedSrc from '../../demos/floating-action-button/FloatingActionButtonExtended.vue?raw';
import FloatingActionButtonSizes from '../../demos/floating-action-button/FloatingActionButtonSizes.vue';
import FloatingActionButtonSizesSrc from '../../demos/floating-action-button/FloatingActionButtonSizes.vue?raw';
import FloatingActionButtonColors from '../../demos/floating-action-button/FloatingActionButtonColors.vue';
import FloatingActionButtonColorsSrc from '../../demos/floating-action-button/FloatingActionButtonColors.vue?raw';
import FloatingActionButtonDisabled from '../../demos/floating-action-button/FloatingActionButtonDisabled.vue';
import FloatingActionButtonDisabledSrc from '../../demos/floating-action-button/FloatingActionButtonDisabled.vue?raw';
import FloatingActionButtonTooltip from '../../demos/floating-action-button/FloatingActionButtonTooltip.vue';
import FloatingActionButtonTooltipSrc from '../../demos/floating-action-button/FloatingActionButtonTooltip.vue?raw';

const props = ref({
  color: 'primary-container',
  size: 'regular',
  href: undefined,
  icon: 'edit',
  disabled: false,
});
</script>

# 悬浮操作按钮

悬浮操作按钮代表屏幕上的主要操作。此组件实现 M3 Expressive FAB 的尺寸和颜色样式；加入标签内容后即成为扩展型 FAB。

操作组件会将 `title` 转换为组件库的工具提示。有关共同行为和可访问名称回退方式，请参阅[操作工具提示](/zh-Hans/components/tooltip#action-tooltips)。

<DemoContainer>
  <FloatingActionButton v-bind="props" aria-label="Edit" />
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="FloatingActionButtonDefaultSrc">
  <FloatingActionButtonDefault />
</DemoContainer>

### 扩展型

<DemoContainer :src="FloatingActionButtonExtendedSrc">
  <FloatingActionButtonExtended />
</DemoContainer>

### 尺寸

<DemoContainer :src="FloatingActionButtonSizesSrc">
  <FloatingActionButtonSizes />
</DemoContainer>

### 颜色

<DemoContainer :src="FloatingActionButtonColorsSrc">
  <FloatingActionButtonColors />
</DemoContainer>

### 禁用

<DemoContainer :src="FloatingActionButtonDisabledSrc">
  <FloatingActionButtonDisabled />
</DemoContainer>

### 工具提示

`title` 会转换为组件库的工具提示，而不是原生 HTML 工具提示。如果没有显式提供可访问名称，它也会作为 `aria-label` 的回退值。

<DemoContainer :src="FloatingActionButtonTooltipSrc">
  <FloatingActionButtonTooltip />
</DemoContainer>

## 参考

<AnatomyTable scope="floating-action-button" />

<ApiTable component="FloatingActionButton" v-model="props" />

<StyleTokenTable component="FloatingActionButton" />
