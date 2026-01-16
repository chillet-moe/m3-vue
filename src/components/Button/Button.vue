<script setup lang="ts">
import style from './Button.module.css';
import { usePressedState } from '@/composables/usePressedState';
import { computed, inject } from 'vue';
import { buttonContextKey, type ButtonProps } from '@/components/Button/Button.ts';

const props = defineProps<ButtonProps>();

// Inject context from ButtonGroup if available
const context = inject(buttonContextKey, undefined);

// Use context values as defaults, but allow props to override
const toggleable = computed(() => props.toggleable ?? context?.toggleable?.value ?? 'none');
const color = computed(() => props.color ?? context?.color?.value ?? 'filled');
const size = computed(() => props.size ?? context?.size?.value ?? 'small');
const shape = computed(() => props.shape ?? context?.shape?.value ?? 'rounded');
const disabled = computed(() => props.disabled ?? context?.disabled?.value ?? false);

const tag = computed(() => {
  if (props.href) {
    return 'a';
  }
  if (toggleable.value == 'single' || toggleable.value == 'multiple') {
    return 'label';
  }
  return 'button';
});

const { pressed, onPointerDown, onPointerUp, onPointerCancel, onLostPointerCapture } = usePressedState();
</script>

<template>
  <component
    :is="tag"
    :class="[
      'state-layer',
      style.button
    ]"
    :data-color="color"
    :data-size="size"
    :data-shape="shape"
    :data-pressed="pressed ? 'true' : 'false'"
    :data-toggleable="toggleable != 'none' ? 'true' : 'false'"
    :href="props.href ? props.href : null"
    :disabled="disabled"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onLostPointerCapture"
  >
    <input v-if="toggleable == 'single'" type="radio" name="buttons" />
    <input v-else-if="toggleable == 'multiple'" type="checkbox" name="buttons" />
    <slot />
  </component>
</template>
