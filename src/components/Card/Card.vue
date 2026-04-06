<script setup lang="ts">
import { computed, inject, unref } from 'vue';
import { cardContextKey } from '@/components/Card/CardContext.ts';
import { usePressedState } from '@/composables/pressedState.ts';

export type CardProps = {
  /** The color style of the card. */
  color?: 'elevated' | 'filled' | 'outlined';

  /** Whether the card is interactive (e.g., clickable). */
  clickable?: boolean;
};

const props = withDefaults(defineProps<CardProps>(), {});

const context = inject(cardContextKey, undefined);

const color = computed(() => props.color ?? unref(context?.color) ?? 'filled');

const { pressed, onPointerDown, onPointerUp, onPointerCancel } = usePressedState();

const slots = defineSlots<{
  /** Default slot for the main content of the card. */
  default(): any;
}>();
</script>

<template>
  <div v-if="!clickable" :class="['m3-card']" :data-color="color">
    <slot />
  </div>
  <button
    v-else
    :class="['m3-card', 'state-layer']"
    :data-color="color"
    :data-pressed="pressed"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
  >
    <slot />
  </button>
</template>

<style src="./Card.css"></style>
