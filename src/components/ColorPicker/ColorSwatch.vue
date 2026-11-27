<script setup lang="ts">
import { cssRgb, type ColorPickerValue } from './color';
defineProps<{ value: ColorPickerValue }>();
</script>

<template>
  <span class="m3-color-swatch" :style="{ '--_swatch-color': cssRgb(value, value.a) }" />
</template>

<style>
@layer components {
  .m3-color-swatch {
    box-sizing: border-box;
    aspect-ratio: 1;
    border-radius: var(--md-shape-compact);
    background:
      linear-gradient(var(--_swatch-color), var(--_swatch-color)),
      repeating-conic-gradient(#c6c6c6 0 25%, #fff 0 50%) 0 0 / 12px 12px;
    box-shadow: inset 0 0 0 1px #0003;
  }
}
</style>
