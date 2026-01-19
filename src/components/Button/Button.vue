<script setup lang="ts">
import style from './Button.module.css';
import { usePressedState } from '@/composables/usePressedState';
import { computed, inject } from 'vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import { Icon } from '@/components/Icon';

export type ButtonProps = {
  /** Whether the button is toggleable (like a checkbox).
   * When true, the button must contain an input element of type checkbox or radio.
   */
  toggleable?: boolean;

  /** The color style of the button. */
  color?: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';

  /** The size of the button. */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

  /** The shape of the button. */
  shape?: 'rounded' | 'square';

  /** The href attribute. If provided, the button will be rendered as an anchor element. */
  href?: string;

  /** Name of the leading icon. */
  leadingIcon?: string;

  /** Name of the trailing icon. */
  trailingIcon?: string;

  /** Whether the button is disabled. */
  disabled?: boolean;
};

const props = withDefaults(defineProps<ButtonProps>(), {
  toggleable: undefined,
  disabled: undefined,
});

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

const slots = defineSlots<{
  /** Slot for leading content, such as an icon.
   * Receives `disabled` as a prop.
   * Will not be used if `leadingIcon` prop is set. */
  leading(props: { disabled: boolean }): any;

  /** Default slot for the main content of the button. Receives `disabled` as a prop. */
  default(props: { disabled: boolean }): any;

  /** Slot for trailing content, such as an icon.
   * Receives `disabled` as a prop.
   * Will not be used if `trailingIcon` prop is set. */
  trailing(props: { disabled: boolean }): any;
}>();
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
    <Icon
      v-if="props.leadingIcon"
      :name="props.leadingIcon"
      :class="[style.leading, style.icon]"
      :disabled="disabled"
    />
    <slot v-else name="leading" :disabled="disabled" />

    <slot name="default" :disabled="disabled" />

    <Icon
      v-if="props.trailingIcon"
      :name="props.trailingIcon"
      :class="[style.trailing, style.icon]"
      :disabled="disabled"
    />
    <slot v-else name="trailing" :disabled="disabled" />
  </component>
</template>
