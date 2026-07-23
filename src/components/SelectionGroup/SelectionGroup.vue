<script setup lang="ts">
import { provide, toRef } from 'vue';

import {
  selectionGroupContextKey,
  type SelectionGroupModelValue,
  type SelectionGroupValue,
} from '@/components/SelectionGroup/SelectionGroupContext';

export type SelectionGroupProps = {
  disabled?: boolean;
  selectionMode?: 'single' | 'multiple';
  name?: string;
  ariaLabel?: string;
};

const props = withDefaults(defineProps<SelectionGroupProps>(), {
  type: 'standard',
  size: 'small',
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<SelectionGroupModelValue>('modelValue');
const inputType = toRef(() => (props.selectionMode === 'multiple' ? 'checkbox' : 'radio'));

const isSelected = (value: SelectionGroupValue) => {
  const currentValue = modelValue.value;

  if (Array.isArray(currentValue)) {
    return currentValue.includes(value);
  }

  return currentValue === value;
};

const select = (value: SelectionGroupValue, checked: boolean) => {
  if (props.selectionMode === 'multiple') {
    const current = Array.isArray(modelValue.value) ? modelValue.value : [];

    if (checked) {
      if (!current.includes(value)) {
        modelValue.value = [...current, value];
      }
      return;
    }

    modelValue.value = current.filter((item) => item !== value);
    return;
  }

  if (checked) {
    modelValue.value = value;
    return;
  }

  modelValue.value = undefined;
};

provide(selectionGroupContextKey, {
  name: toRef(() => props.name),
  disabled: toRef(() => props.disabled),
  inputType,
  isSelected,
  select,
});
</script>

<template>
  <fieldset :aria-label="ariaLabel" data-scope="selection-group" data-part="root">
    <slot />
  </fieldset>
</template>
