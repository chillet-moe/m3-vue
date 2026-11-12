<script setup lang="ts">
import {
  provideSelectionGroup,
  type SelectionGroupModelValue,
  type SelectionGroupProps,
} from './SelectionGroupContext';

export type { SelectionGroupProps } from './SelectionGroupContext';

const props = withDefaults(defineProps<SelectionGroupProps>(), {
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<SelectionGroupModelValue>('modelValue');
provideSelectionGroup(modelValue, props);
</script>

<template>
  <fieldset class="m3-selection-group" :aria-label="ariaLabel" data-scope="selection-group" data-part="root">
    <slot />
  </fieldset>
</template>

<style src="./SelectionGroup.css"></style>
