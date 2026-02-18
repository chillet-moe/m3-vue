<script setup lang="ts">
import styles from './Tooltip.module.css';

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
  <div :class="styles.tooltip" :data-variant="variant">
    <slot name="default"></slot>
  </div>
</template>
