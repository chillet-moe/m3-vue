<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

type IconWeight = number | string | 'inherit';

type IconProps = {
  /** The name of the Material Symbols Outlined icon to display. */
  name: string;

  /** An explicit Icon size that overrides the variant default and --md-icon-size context. Accepts any valid CSS font-size value, such as "24px", "1.5em". */
  size?: string;

  /** The font-weight of the Icon */
  weight?: IconWeight;

  /** Variant of the Icon. "standalone" (default) uses the default size and weight. "inline" follows the surrounding text size and weight unless explicitly overridden. */
  variant?: 'standalone' | 'inline';
};

const { size, weight, variant = 'standalone' } = defineProps<IconProps>();

const resolvedWeight = computed<IconWeight>(() => {
  const defaultWeight = variant === 'standalone' ? 400 : 'inherit';
  return weight ?? defaultWeight;
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
  <span class="m3-icon" data-scope="icon" data-part="root" :data-variant="variant" :style="iconStyle">{{ name }}</span>
</template>

<style src="./Icon.css"></style>
