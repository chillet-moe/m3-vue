<script setup lang="ts">
import style from './ButtonGroup.module.css';
import { provide, ref } from 'vue';
import { buttonContextKey, type ButtonProps } from './Button.ts';

type Props = {
  type?: 'standard' | 'connected';
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
  multiple?: boolean;
  disabled?: boolean;
};

const { type = 'standard', color = 'tonal', size = 'small', multiple = false, disabled = false } = defineProps<Props>();

provide(buttonContextKey, {
  size: ref(size),
  color: ref(color as ButtonProps['color']),
  toggleable: ref((multiple ? 'multiple' : 'single') as ButtonProps['toggleable']),
  disabled: ref(disabled),
});
</script>

<template>
  <fieldset :class="style.buttonGroup" :data-type="type" :data-size="size">
    <slot />
  </fieldset>
</template>

<style scoped></style>
