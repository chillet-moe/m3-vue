<script setup lang="ts">
import style from './Button.module.css';
import { usePressedState } from '@/composables/usePressedState';

type Props = {
  variant?: 'Elevated' | 'Filled' | 'Tonal' | 'Outlined' | 'Text'
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL'
  shape?: 'Rounded' | 'Square'
};

const {
  variant = 'Filled',
  size = 'S',
  shape = 'Rounded'
} = defineProps<Props>();

const {
  pressed,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture
} = usePressedState();

</script>

<template>
  <button
    :class="[
      'state-layer',
      style.Button,
      style[variant],
      style[size],
      style[shape],
      pressed ? style.Pressed : ''
    ]"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onLostPointerCapture"
  >
    <slot/>
  </button>
</template>
