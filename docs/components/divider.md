---
title: Divider
---

<script setup lang="ts">
import { ref } from 'vue';
import { Divider } from '@/components/Divider';

import DividerDefault from '../demos/divider/DividerDefault.vue';
import DividerDefaultSrc from '../demos/divider/DividerDefault.vue?raw';
import DividerInset from '../demos/divider/DividerInset.vue';
import DividerInsetSrc from '../demos/divider/DividerInset.vue?raw';
import DividerVertical from '../demos/divider/DividerVertical.vue';
import DividerVerticalSrc from '../demos/divider/DividerVertical.vue?raw';
import DividerCustomSpacing from '../demos/divider/DividerCustomSpacing.vue';
import DividerCustomSpacingSrc from '../demos/divider/DividerCustomSpacing.vue?raw';

const props = ref({
  orientation: 'horizontal',
  inset: 'none',
  thickness: undefined,
  spacing: undefined,
});
</script>

# Divider

Dividers separate related content into clear groups.

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 1rem; inline-size: min(100%, 22rem)">
    <span>Section one</span>
    <Divider v-bind="props" />
    <span>Section two</span>
  </div>
</DemoContainer>

<AnatomyTable scope="divider" />

<ApiTable component="Divider" v-model="props" />

## Examples

### Default

<DemoContainer :src="DividerDefaultSrc" :viewport="false">
  <DividerDefault />
</DemoContainer>

### Inset

<DemoContainer :src="DividerInsetSrc" :viewport="false">
  <DividerInset />
</DemoContainer>

### Vertical

<DemoContainer :src="DividerVerticalSrc" :viewport="false">
  <DividerVertical />
</DemoContainer>

### Custom Spacing

<DemoContainer :src="DividerCustomSpacingSrc" :viewport="false">
  <DividerCustomSpacing />
</DemoContainer>
