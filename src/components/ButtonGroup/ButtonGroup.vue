<script setup lang="ts">
import { provide, toRef } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import type { SelectionGroupModelValue } from '@/components/SelectionGroup/SelectionGroupContext';
import SelectionGroup, { type SelectionGroupProps } from '@/components/SelectionGroup/SelectionGroup.vue';

export type ButtonGroupProps = SelectionGroupProps & {
  type?: 'standard' | 'connected';
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
};

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  type: 'standard',
  color: 'tonal',
  size: 'small',
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<SelectionGroupModelValue>('modelValue');

provide(buttonContextKey, {
  size: toRef(() => props.size),
  color: toRef(() => props.color),
  toggleable: toRef(() => true),
  disabled: toRef(() => props.disabled),
});
</script>

<template>
  <SelectionGroup
    v-model="modelValue"
    class="m3-button-group"
    data-scope="button-group"
    data-part="root"
    :disabled="disabled"
    :selection-mode="selectionMode"
    :name="name"
    :aria-label="ariaLabel"
    :data-type="type"
    :data-size="size"
  >
    <slot />
  </SelectionGroup>
</template>

<style src="./ButtonGroup.css"></style>
