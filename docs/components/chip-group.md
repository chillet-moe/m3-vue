---
title: ChipGroup
---

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Chip } from '@/components/Chip';
import { ChipGroup } from '@/components/ChipGroup';

import ChipGroupDefault from '../demos/chip-group/ChipGroupDefault.vue';
import ChipGroupDefaultSrc from '../demos/chip-group/ChipGroupDefault.vue?raw';
import ChipGroupMultiple from '../demos/chip-group/ChipGroupMultiple.vue';
import ChipGroupMultipleSrc from '../demos/chip-group/ChipGroupMultiple.vue?raw';

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

Chip groups coordinate single or multiple chip selection while keeping the chips themselves fully reusable.

## Demo

### Interactive

<DemoContainer :viewport="false">
  <ChipGroup v-bind="props" v-model="modelValue" name="chip-group-docs" aria-label="Suggested filters">
    <Chip variant="filter" value="selected">Selected</Chip>
    <Chip variant="filter" value="alerts">Alerts</Chip>
    <Chip variant="filter" value="saved">Saved</Chip>
  </ChipGroup>
</DemoContainer>

<Controls component="ChipGroup" v-model="props" :exclude="['name', 'ariaLabel']" />

### Default

<DemoContainer :src="ChipGroupDefaultSrc" :viewport="false">
  <ChipGroupDefault />
</DemoContainer>

### Multiple Selection

<DemoContainer :src="ChipGroupMultipleSrc" :viewport="false">
  <ChipGroupMultiple />
</DemoContainer>

## API

<ApiTable component="ChipGroup" />
