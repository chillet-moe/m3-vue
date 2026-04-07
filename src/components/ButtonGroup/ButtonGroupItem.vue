<script setup lang="ts">
import { computed, inject, unref } from 'vue';

import Button from '@/components/Button/Button.vue';
import { buttonGroupContextKey, type ButtonGroupValue } from '@/components/ButtonGroup/ButtonGroupContext';

export type ButtonGroupItemProps = {
  value: ButtonGroupValue;
  disabled?: boolean;
  ariaLabel?: string;
};

const { value, disabled = false, ariaLabel } = defineProps<ButtonGroupItemProps>();

const context = inject(buttonGroupContextKey, undefined);

const isChecked = computed(() => {
  const currentValue = unref(context?.modelValue);

  if (Array.isArray(currentValue)) {
    return currentValue.includes(value);
  }

  return currentValue === value;
});

const inputType = computed(() => {
  if (unref(context?.selectionMode) === 'multiple') {
    return 'checkbox';
  }

  return 'radio';
});

const inputName = computed(() => {
  return unref(context?.name);
});

const mergedDisabled = computed(() => {
  return disabled || unref(context?.disabled) || false;
});

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  context?.select(value, target.checked);
};

defineSlots<{
  default(): any;
}>();
</script>

<template>
  <Button :disabled="mergedDisabled">
    <input
      :type="inputType"
      :name="inputName"
      :value="String(value)"
      :checked="isChecked"
      :disabled="mergedDisabled"
      :aria-label="ariaLabel"
      @change="onChange"
    />
    <slot />
  </Button>
</template>
