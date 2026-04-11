<script setup lang="ts">
import type { SelectionGroupModelValue } from '@/components/SelectionGroup/SelectionGroupContext';
import SelectionGroup, { type SelectionGroupProps } from '@/components/SelectionGroup/SelectionGroup.vue';

export type ChipGroupProps = SelectionGroupProps;

const props = withDefaults(defineProps<ChipGroupProps>(), {
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<SelectionGroupModelValue>('modelValue');

defineSlots<{
  /** Chip content. */
  default(): any;
}>();
</script>

<template>
  <SelectionGroup
    v-model="modelValue"
    :class="'m3-chip-group'"
    data-scope="chip-group"
    data-part="root"
    :disabled="props.disabled"
    :selection-mode="props.selectionMode"
    :name="props.name"
    :aria-label="props.ariaLabel"
  >
    <slot />
  </SelectionGroup>
</template>

<style src="./ChipGroup.css"></style>
