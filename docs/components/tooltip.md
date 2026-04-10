---
title: Tooltip
---

<script setup lang="ts">
import { ref } from 'vue';
import { Tooltip } from '@/components/Tooltip';

import TooltipDefault from '../demos/tooltip/TooltipDefault.vue';
import TooltipDefaultSrc from '../demos/tooltip/TooltipDefault.vue?raw';
import TooltipVariants from '../demos/tooltip/TooltipVariants.vue';
import TooltipVariantsSrc from '../demos/tooltip/TooltipVariants.vue?raw';
import TooltipPopoverTypes from '../demos/tooltip/TooltipPopoverTypes.vue';
import TooltipPopoverTypesSrc from '../demos/tooltip/TooltipPopoverTypes.vue?raw';

const props = ref({
  variant: 'plain',
  popover: 'hint',
});

const content = ref('Tooltip');
</script>

# Tooltip

Tooltip exposes the shared tooltip surface for plain and rich treatments, with control over the underlying popover behavior.

## Demo

### Interactive

<DemoContainer :viewport="false">
  <Tooltip v-bind="props">{{ content }}</Tooltip>
</DemoContainer>

<ApiTable component="Tooltip" v-model="props" />

### Default

<DemoContainer :src="TooltipDefaultSrc" :viewport="false">
  <TooltipDefault />
</DemoContainer>

### Variants

<DemoContainer :src="TooltipVariantsSrc" :viewport="false">
  <TooltipVariants />
</DemoContainer>

### Popover Types

<DemoContainer :src="TooltipPopoverTypesSrc" :viewport="false">
  <TooltipPopoverTypes />
</DemoContainer>
