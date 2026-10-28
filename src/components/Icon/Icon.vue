<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

type IconWeight = number | string | 'inherit';

type IconProps = {
  /** The name of the Material Symbols Outlined icon to display. */
  name?: string;

  /** Nominal visible fraction of the source canvas (0.1–1). Defaults to 5/6 for Symbols and 1 for SVG slots. */
  contentRatio?: number;

  /** An explicit Icon size that overrides the variant default and --md-icon-size context. Accepts any valid CSS font-size value, such as "24px", "1.5em". */
  size?: string;

  /** The font-weight of the Icon */
  weight?: IconWeight;

  /** Variant of the Icon. "standalone" (default) uses the default size and weight. "inline" follows the surrounding text size and weight unless explicitly overridden. */
  variant?: 'standalone' | 'inline';
};

const { size, weight, contentRatio, variant = 'standalone' } = defineProps<IconProps>();
const slots = defineSlots<{
  /** Alternative SVG source. Takes precedence over name; set its contentRatio when the viewBox includes whitespace. */
  default?(): any;
}>();

const resolvedWeight = computed<IconWeight>(() => {
  const defaultWeight = variant === 'standalone' ? 400 : 'inherit';
  return weight ?? defaultWeight;
});

const iconStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  if (size) {
    style.fontSize = size;
  }
  if (contentRatio !== undefined) {
    style['--md-icon-content-ratio'] = String(contentRatio);
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
  <span
    class="m3-icon"
    data-scope="icon"
    data-part="root"
    :data-variant="variant"
    :data-source="slots.default ? 'svg' : 'symbol'"
    :style="iconStyle"
  >
    <span class="m3-icon-glyph" data-part="glyph"
      ><slot>{{ name }}</slot></span
    >
  </span>
</template>

<style src="./Icon.css"></style>
