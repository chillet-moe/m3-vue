<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { computed, inject, unref } from 'vue';
import { cardContextKey } from '@/components/Card/CardContext.ts';
import { usePressShapeMorphAttrs } from '@/composables/usePressShapeMorph';

export type CardProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** The color style of the card. */
  color?: 'elevated' | 'filled' | 'outlined';

  /** Whether the card is interactive (e.g., clickable). */
  clickable?: boolean;
};

const props = defineProps<CardProps>();

const context = inject(cardContextKey, undefined);

const color = computed(() => props.color ?? unref(context?.color) ?? 'filled');

const pressShapeMorphAttrs = usePressShapeMorphAttrs();

defineSlots<{
  /** Default slot for the main content of the card. */
  default(): any;
}>();
const shape = useShape(() => props.shape);
</script>

<template>
  <component
    v-state-layer
    :is="clickable ? 'button' : 'div'"
    class="m3-card"
    :class="{ 'm3-state-layer': clickable }"
    :type="clickable ? 'button' : undefined"
    data-scope="card"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-color="color"
    v-bind="clickable ? pressShapeMorphAttrs : undefined"
  >
    <slot />
  </component>
</template>

<style src="./Card.css"></style>
