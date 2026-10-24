---
title: ChipGroup
---

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Chip } from '@/components/Chip';
import { ChipGroup } from '@/components/ChipGroup';

import ChipGroupDefault from '../../demos/chip-group/ChipGroupDefault.vue';
import ChipGroupDefaultSrc from '../../demos/chip-group/ChipGroupDefault.vue?raw';
import ChipGroupMultiple from '../../demos/chip-group/ChipGroupMultiple.vue';
import ChipGroupMultipleSrc from '../../demos/chip-group/ChipGroupMultiple.vue?raw';

const props = ref({
  disabled: false,
  selectionMode: 'single',
});

const modelValue = ref<string | string[]>('selected');

watch(
  () => props.value.selectionMode,
  (selectionMode) => {
    modelValue.value = selectionMode === 'multiple' ? ['selected'] : 'selected';
  },
  { immediate: true },
);
</script>

# ChipGroup

ChipGroup 用于协调单选或多选，同时让 Chip 本身保持可复用。

<DemoContainer :viewport="false">
  <ChipGroup v-bind="props" v-model="modelValue" name="chip-group-docs" aria-label="建议的筛选条件">
    <Chip variant="filter" value="selected">已选</Chip>
    <Chip variant="filter" value="alerts">提醒</Chip>
    <Chip variant="filter" value="saved">已保存</Chip>
  </ChipGroup>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="ChipGroupDefaultSrc" :viewport="false">
  <ChipGroupDefault />
</DemoContainer>

### 多项展开 Selection

<DemoContainer :src="ChipGroupMultipleSrc" :viewport="false">
  <ChipGroupMultiple />
</DemoContainer>

## 参考

<AnatomyTable scope="chip-group" />

<ApiTable component="ChipGroup" v-model="props" :exclude="['name', 'ariaLabel']" />
