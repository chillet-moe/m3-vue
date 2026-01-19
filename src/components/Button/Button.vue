<script setup lang="ts">
import style from './Button.module.css';
import { usePressedState } from '@/composables/usePressedState';
import { computed, inject } from 'vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';

export type ButtonProps = {
  // Why use Boolean: https://vuejs.org/guide/components/props#boolean-casting

  /** Whether the button is toggleable (like a checkbox).
   * When true, the button must contain an input element of type checkbox or radio.
   */
  // oxlint-disable-next-line typescript/no-wrapper-object-types
  toggleable?: Boolean;

  /** The color style of the button. */
  color?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';

  /** The size of the button. */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

  /** The shape of the button. */
  shape?: 'rounded' | 'square';

  /** The href attribute. If provided, the button will be rendered as an anchor element. */
  href?: string;

  /** Whether the button is disabled. */
  // oxlint-disable-next-line typescript/no-wrapper-object-types
  disabled?: Boolean;
};

const props = defineProps<ButtonProps>();

const context = inject(buttonContextKey, undefined);

const toggleable = computed(() => props.toggleable ?? context?.toggleable?.value ?? false);
const color = computed(() => props.color ?? context?.color?.value ?? 'filled');
const size = computed(() => props.size ?? context?.size?.value ?? 'small');
const shape = computed(() => props.shape ?? context?.shape?.value ?? 'rounded');
const disabled = computed(() => props.disabled ?? context?.disabled?.value ?? false);

const tag = computed(() => {
  if (props.href) {
    return 'a';
  }
  if (toggleable.value) {
    return 'label';
  }
  return 'button';
});

const { pressed, onPointerDown, onPointerUp, onPointerCancel, onLostPointerCapture } = usePressedState();
</script>

<template>
  <component
    :is="tag"
    :class="['state-layer', style.button]"
    :data-color="color"
    :data-size="size"
    :data-shape="shape"
    :data-pressed="!disabled && pressed ? 'true' : 'false'"
    :data-toggleable="toggleable ? 'true' : 'false'"
    :href="props.href ? props.href : null"
    :disabled="disabled ? '' : undefined"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onLostPointerCapture"
  >
    <slot :disabled="disabled" />
  </component>
</template>
