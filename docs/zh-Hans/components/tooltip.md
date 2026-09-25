---
title: Tooltip
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tooltip } from '@/components/Tooltip';

import TooltipDefault from '../../demos/tooltip/TooltipDefault.vue';
import TooltipDefaultSrc from '../../demos/tooltip/TooltipDefault.vue?raw';
import TooltipVariants from '../../demos/tooltip/TooltipVariants.vue';
import TooltipVariantsSrc from '../../demos/tooltip/TooltipVariants.vue?raw';
import TooltipPopoverTypes from '../../demos/tooltip/TooltipPopoverTypes.vue';
import TooltipPopoverTypesSrc from '../../demos/tooltip/TooltipPopoverTypes.vue?raw';

const props = ref({
  variant: 'plain',
  popover: 'hint',
});

const content = ref('Tooltip');
</script>

# Tooltip

Tooltip 提供通用的工具提示界面，支持纯文本和丰富内容样式，并可控制底层弹出层行为。

<DemoContainer :viewport="false">
  <Tooltip v-bind="props">{{ content }}</Tooltip>
</DemoContainer>

<AnatomyTable scope="tooltip" />

<ApiTable component="Tooltip" v-model="props" />

<StyleTokenTable component="Tooltip" />

### 默认

<DemoContainer :src="TooltipDefaultSrc" :viewport="false">
  <TooltipDefault />
</DemoContainer>

### 变体

<DemoContainer :src="TooltipVariantsSrc" :viewport="false">
  <TooltipVariants />
</DemoContainer>

### 弹出层类型

<DemoContainer :src="TooltipPopoverTypesSrc" :viewport="false">
  <TooltipPopoverTypes />
</DemoContainer>
