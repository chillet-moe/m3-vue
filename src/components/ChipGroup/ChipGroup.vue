<script setup lang="ts">
import type { SelectionGroupModelValue, SelectionGroupProps } from '@/components/SelectionGroup/SelectionGroupContext';
import SelectionGroupFieldset from '@/components/SelectionGroup/SelectionGroupFieldset.vue';

export type ChipGroupProps = SelectionGroupProps;

const props = withDefaults(defineProps<ChipGroupProps>(), {
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<SelectionGroupModelValue>('modelValue');
const selection = { modelValue };

defineSlots<{
  /** Chip content. */
  default(): any;
}>();
</script>

<template>
  <SelectionGroupFieldset
    :selection-model="selection.modelValue"
    :class="'m3-chip-group'"
    data-scope="chip-group"
    data-part="root"
    :disabled="props.disabled"
    :selection-mode="props.selectionMode"
    :name="props.name"
    :aria-label="props.ariaLabel"
  >
    <slot />
  </SelectionGroupFieldset>
</template>

<style src="./ChipGroup.css"></style>
