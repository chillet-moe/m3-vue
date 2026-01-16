<script setup lang="ts">
import style from './Button.module.css';
import { usePressedState } from '@/composables/usePressedState';
import { computed } from 'vue';

type Props = {
  toggleable?: 'none' | 'single' | 'multiple';
  variant?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  shape?: 'rounded' | 'square';
  href?: string;
};

const { toggleable = 'none', variant = 'filled', size = 'small', shape = 'rounded', href } = defineProps<Props>();

const tag = computed(() => {
  if (href) {
    return 'a';
  }
  if (toggleable == 'single' || toggleable == 'multiple') {
    return 'label';
  }
  return 'button';
});

const { pressed, onPointerDown, onPointerUp, onPointerCancel, onLostPointerCapture } = usePressedState();
</script>

<template>
  <component
    :is="tag"
    :class="[
      'state-layer',
      style.button,
      style[variant],
      style[size],
      style[shape],
      pressed ? style.Pressed : '',
      toggleable != 'none' ? style.Toggleable : '',
    ]"
    :href="href ? href : null"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onLostPointerCapture"
  >
    <input v-if="toggleable == 'single'" type="radio" name="buttons" />
    <input v-else-if="toggleable == 'multiple'" type="checkbox" name="buttons" />
    <slot />
  </component>
</template>
