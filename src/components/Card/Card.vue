<script setup lang="ts">
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { computed, inject, unref } from 'vue';
import { cardContextKey } from '@/components/Card/CardContext.ts';
import { usePressShapeMorph } from '@/composables/usePressShapeMorph';

export type CardProps = {
  /** The color style of the card. */
  color?: 'elevated' | 'filled' | 'outlined';

  /** Whether the card is interactive (e.g., clickable). */
  clickable?: boolean;
};

const props = withDefaults(defineProps<CardProps>(), {});

const context = inject(cardContextKey, undefined);

const color = computed(() => props.color ?? unref(context?.color) ?? 'filled');

const { pressShapeMorphAttrs } = usePressShapeMorph();

const slots = defineSlots<{
  /** Default slot for the main content of the card. */
  default(): any;
}>();
</script>

<template>
  <div v-if="!clickable" :class="['m3-card']" data-scope="card" data-part="root" :data-color="color">
    <slot />
  </div>
  <button
    v-state-layer
    v-else
    :class="['m3-card', 'm3-state-layer']"
    data-scope="card"
    data-part="root"
    :data-color="color"
    v-bind="pressShapeMorphAttrs"
  >
    <slot />
  </button>
</template>

<style src="./Card.css"></style>
