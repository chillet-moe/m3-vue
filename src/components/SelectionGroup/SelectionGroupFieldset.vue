<script setup lang="ts">
import type { Ref } from 'vue';
import {
  provideSelectionGroup,
  type SelectionGroupModelValue,
  type SelectionGroupProps,
} from './SelectionGroupContext';

const props = defineProps<SelectionGroupProps & { selectionModel: Ref<SelectionGroupModelValue> }>();

// Keep the model in the public group and the slot render in this fieldset.
provideSelectionGroup(props.selectionModel, props);
</script>

<template>
  <fieldset
    class="m3-selection-group"
    :aria-label="ariaLabel"
    :disabled="props.disabled"
    data-scope="selection-group"
    data-part="root"
  >
    <slot />
  </fieldset>
</template>

<style src="./SelectionGroup.css"></style>
