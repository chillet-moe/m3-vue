<script setup lang="ts">
import style from './ButtonGroup.module.css';
import { provide, ref } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';

export type ButtonGroupProps = {
  type?: 'standard' | 'connected';
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  disabled?: boolean;
};

const { type = 'standard', color = 'tonal', size = 'small', disabled = false } = defineProps<ButtonGroupProps>();

provide(buttonContextKey, {
  size: ref(size),
  color: ref(color),
  toggleable: ref(true),
  disabled: ref(disabled),
});
</script>

<template>
  <fieldset :class="style.buttonGroup" :data-type="type" :data-size="size">
    <slot />
  </fieldset>
</template>

<style scoped></style>
