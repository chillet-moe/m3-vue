<script setup lang="ts">

export type TooltipProps = {
  /** The variant of the tooltip. */
  variant?: 'plain' | 'rich';
}

const {
  variant = 'plain',
} = defineProps<TooltipProps>();

const slots = defineSlots<{
  /**
   * The default slot for the tooltip content.
   */
  default(): any;
}>();
</script>

<template>
  <div :class="'m3-tooltip'" :data-variant="variant">
    <slot name="default"></slot>
  </div>
</template>

<style src="./Tooltip.css"></style>
