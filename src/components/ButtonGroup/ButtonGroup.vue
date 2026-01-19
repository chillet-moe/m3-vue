<script setup lang="ts">
import style from './ButtonGroup.module.css';
import { provide, toRef } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';

export type ButtonGroupProps = {
  type?: 'standard' | 'connected';
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  disabled?: boolean;
};

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  type: 'standard',
  color: 'tonal',
  size: 'small',
  disabled: false,
});

provide(buttonContextKey, {
  size: toRef(() => props.size),
  color: toRef(() => props.color),
  toggleable: toRef(() => true),
  disabled: toRef(() => props.disabled),
});
</script>

<template>
  <fieldset :class="style.buttonGroup" :data-type="type" :data-size="size">
    <slot />
  </fieldset>
</template>

<style scoped></style>
