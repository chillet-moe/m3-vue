<script setup lang="ts">
export type TooltipProps = {
  /** The variant of the tooltip. */
  variant?: 'plain' | 'rich';
  /** The popover behavior of the tooltip. */
  popover?: 'auto' | 'hint' | 'manual';
};

const { variant = 'plain', popover = 'hint' } = defineProps<TooltipProps>();

const slots = defineSlots<{
  /**
   * The default slot for the tooltip content.
   */
  default(): any;
}>();
</script>

<template>
  <div :class="'m3-tooltip'" data-scope="tooltip" data-part="root" :data-variant="variant" :popover="popover">
    <slot name="default"></slot>
  </div>
</template>

<style src="./Tooltip.css"></style>
