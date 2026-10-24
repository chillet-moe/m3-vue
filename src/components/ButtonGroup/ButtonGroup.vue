<script setup lang="ts">
import { inject, provide, toRef, unref } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import type { SelectionGroupModelValue } from '@/components/SelectionGroup/SelectionGroupContext';
import SelectionGroup, { type SelectionGroupProps } from '@/components/SelectionGroup/SelectionGroup.vue';

export type ButtonGroupProps = SelectionGroupProps & {
  type?: 'standard' | 'connected';
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  pressShapeMorph?: ButtonProps['pressShapeMorph'];
};

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  type: 'standard',
  variant: 'tonal',
  size: 'small',
  pressShapeMorph: undefined,
  disabled: false,
  selectionMode: 'single',
});

const modelValue = defineModel<SelectionGroupModelValue>('modelValue');
const parentButtonContext = inject(buttonContextKey, undefined);

provide(buttonContextKey, {
  size: toRef(() => props.size),
  variant: toRef(() => props.variant),
  pressShapeMorph: toRef(() => props.pressShapeMorph ?? unref(parentButtonContext?.pressShapeMorph)),
  toggleable: toRef(() => true),
  shape: parentButtonContext?.shape,
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
