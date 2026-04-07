<script setup lang="ts">
import { provide, toRef } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import { buttonGroupContextKey, type ButtonGroupModelValue, type ButtonGroupValue } from '@/components/ButtonGroup/ButtonGroupContext';

export type ButtonGroupProps = {
  type?: 'standard' | 'connected';
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  disabled?: boolean;
  selectionMode?: 'single' | 'multiple';
  name?: string;
  ariaLabel?: string;
};

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  type: 'standard',
  color: 'tonal',
  size: 'small',
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<ButtonGroupModelValue>('modelValue');

const select = (value: ButtonGroupValue, checked: boolean) => {
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

provide(buttonContextKey, {
  size: toRef(() => props.size),
  color: toRef(() => props.color),
  toggleable: toRef(() => true),
  disabled: toRef(() => props.disabled),
});

provide(buttonGroupContextKey, {
  name: toRef(() => props.name),
  disabled: toRef(() => props.disabled),
  selectionMode: toRef(() => props.selectionMode),
  modelValue,
  select,
});
</script>

<template>
  <fieldset :class="'m3-button-group'" :data-type="type" :data-size="size" :aria-label="ariaLabel">
    <slot />
  </fieldset>
</template>

<style src="./ButtonGroup.css"></style>
