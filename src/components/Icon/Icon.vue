<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

type IconWeight = number | 'inherit';

type IconProps = {
  /** The name of the Material Symbols Outlined icon to display. */
  name: string;

  /** The size of the Icon. Accepts any valid CSS font-size value, such as "24px", "1.5em". */
  size?: string;

  /** The font-weight of the Icon */
  weight?: IconWeight;

  /** Variant of the Icon. "standalone" (default) means the Icon will use the default weight of 400 if weight is not specified. "inline" means the Icon will inherit the font-weight from its context if weight is not specified. */
  variant?: 'standalone' | 'inline';
};

const { size, weight, variant = 'standalone' } = defineProps<IconProps>();

const resolvedWeight = computed<IconWeight>(() => {
  return weight ?? (variant === 'inline' ? 'inherit' : 400);
});

const iconStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  if (size) {
    style.fontSize = size;
  }

  if (resolvedWeight.value === 'inherit') {
    style.fontWeight = 'inherit';
  } else {
    style['--m3-icon-weight'] = String(resolvedWeight.value);
  }

  return style;
});
</script>

<template>
  <span class="m3-icon" data-scope="icon" data-part="root" :style="iconStyle">{{ name }}</span>
</template>

<style src="./Icon.css"></style>
