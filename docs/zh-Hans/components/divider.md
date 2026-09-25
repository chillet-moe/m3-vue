---
title: 分隔线
---

<script setup lang="ts">
import { ref } from 'vue';
import { Divider } from '@/components/Divider';

import DividerDefault from '../../demos/divider/DividerDefault.vue';
import DividerDefaultSrc from '../../demos/divider/DividerDefault.vue?raw';
import DividerInset from '../../demos/divider/DividerInset.vue';
import DividerInsetSrc from '../../demos/divider/DividerInset.vue?raw';
import DividerVertical from '../../demos/divider/DividerVertical.vue';
import DividerVerticalSrc from '../../demos/divider/DividerVertical.vue?raw';
import DividerCustomSpacing from '../../demos/divider/DividerCustomSpacing.vue';
import DividerCustomSpacingSrc from '../../demos/divider/DividerCustomSpacing.vue?raw';

const props = ref({
  orientation: 'horizontal',
  inset: 'none',
  thickness: undefined,
  spacing: undefined,
});
</script>

# 分隔线

分隔线用于将相关内容划分为清晰的组。

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 1rem; inline-size: min(100%, 22rem)">
    <span>分区一</span>
    <Divider v-bind="props" />
    <span>分区二</span>
  </div>
</DemoContainer>

<AnatomyTable scope="divider" />

<ApiTable component="Divider" v-model="props" />

<StyleTokenTable component="Divider" />

## 示例

### 默认

<DemoContainer :src="DividerDefaultSrc" :viewport="false">
  <DividerDefault />
</DemoContainer>

### 内缩

<DemoContainer :src="DividerInsetSrc" :viewport="false">
  <DividerInset />
</DemoContainer>

### 垂直

<DemoContainer :src="DividerVerticalSrc" :viewport="false">
  <DividerVertical />
</DemoContainer>

### 自定义间距

<DemoContainer :src="DividerCustomSpacingSrc" :viewport="false">
  <DividerCustomSpacing />
</DemoContainer>
