<script setup lang="ts">
import style from './Card.module.css';
import { computed, inject, unref } from 'vue';
import { cardContextKey } from "@/components/Card/CardContext.ts";

export type CardProps = {

  /** The color style of the card. */
  color?: 'elevated' | 'filled' | 'outlined';
};

const props = withDefaults(defineProps<CardProps>(), {
});

const context = inject(cardContextKey, undefined);

const color = computed(() => props.color ?? unref(context?.color) ?? 'filled');

const slots = defineSlots<{
  /** Default slot for the main content of the card. */
  default(): any;
}>();
</script>

<template>
  <div
    :class="[style.card]"
    :data-color="color"
  >
    <slot />
  </div>
</template>
