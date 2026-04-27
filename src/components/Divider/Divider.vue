<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

export type DividerProps = {
  /** Direction of the divider line. */
  orientation?: 'horizontal' | 'vertical';

  /** Apply inset spacing on either side of the divider. */
  inset?: 'none' | 'start' | 'end' | 'both';

  /** Line thickness. Such as '1px' or '0.125rem'. */
  thickness?: string;

  /** Symmetric space around the divider. Such as '0.75rem'. */
  spacing?: string;
};

const props = withDefaults(defineProps<DividerProps>(), {
  orientation: 'horizontal',
  inset: 'none',
  thickness: undefined,
  spacing: undefined,
});

const rootStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {};

  if (props.thickness) {
    style['--md-divider-thickness'] = props.thickness;
  }

  if (props.spacing) {
    style['--md-divider-spacing'] = props.spacing;
  }

  return style as CSSProperties;
});
</script>

<template>
  <div
    class="m3-divider"
    data-scope="divider"
    data-part="root"
    :data-orientation="props.orientation"
    :data-inset="props.inset"
    :style="rootStyle"
    role="separator"
    :aria-orientation="props.orientation"
  />
</template>

<style src="./Divider.css"></style>
