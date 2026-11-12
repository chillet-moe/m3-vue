<script setup lang="ts">
import type { SelectionGroupModelValue, SelectionGroupProps } from './SelectionGroupContext';
import SelectionGroupFieldset from './SelectionGroupFieldset.vue';

export type { SelectionGroupProps } from './SelectionGroupContext';

const props = withDefaults(defineProps<SelectionGroupProps>(), {
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<SelectionGroupModelValue>('modelValue');
const selection = { modelValue };
</script>

<template>
  <SelectionGroupFieldset v-bind="props" :selection-model="selection.modelValue">
    <slot />
  </SelectionGroupFieldset>
</template>
