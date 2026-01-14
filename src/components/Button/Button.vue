<script setup lang="ts">
import style from './Button.module.css';
import { usePressedState } from '@/composables/usePressedState';
import { computed } from 'vue';

type Props = {
  toggleable?: 'none' | 'single' | 'multiple';
  variant?: 'Elevated' | 'Filled' | 'Tonal' | 'Outlined' | 'Text';
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  shape?: 'Rounded' | 'Square';
  href?: string;
};

const { toggleable = 'none', variant = 'Filled', size = 'S', shape = 'Rounded', href } = defineProps<Props>();

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
      style.Button,
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
