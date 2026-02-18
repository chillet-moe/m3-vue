<script setup lang="ts">
import style from './IconButton.module.css';
import { usePressedState } from '@/composables/pressedState.ts';
import { computed, inject, unref } from 'vue';
import { Icon } from '@/components/Icon';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext.ts';

export type IconButtonProps = {
  /** Whether the button is toggleable (like a checkbox).
   * When true, the button must contain an input element of type checkbox or radio.
   */
  toggleable?: boolean;

  /** The color style of the button. */
  color?: 'filled' | 'tonal' | 'outlined' | 'standard';

  /** The size of the button. */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

  /** The shape of the button. */
  shape?: 'rounded' | 'square';

  /** The width of the button. */
  width?: 'default' | 'narrow' | 'wide';

  /** The href attribute. If provided, the button will be rendered as an anchor element. */
  href?: string;

  /** Name of the icon. */
  icon?: string;

  /** Whether the button is disabled. */
  disabled?: boolean;
};

const props = withDefaults(defineProps<IconButtonProps>(), {
  toggleable: undefined,
  disabled: undefined,
});

const context = inject(iconButtonContextKey, undefined);

const toggleable = computed(() => props.toggleable ?? unref(context?.toggleable) ?? false);
const color = computed(() => props.color ?? unref(context?.color) ?? 'filled');
const size = computed(() => props.size ?? unref(context?.size) ?? 'small');
const shape = computed(() => props.shape ?? unref(context?.shape) ?? 'rounded');
const width = computed(() => props.width ?? unref(context?.width) ?? 'default');
const disabled = computed(() => props.disabled ?? unref(context?.disabled) ?? false);

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
  /** Default slot for the main content of the icon button. Receives `disabled` as a prop. */
  default(props: { disabled: boolean }): any;
}>();
</script>

<template>
  <component
    :is="tag"
    :class="['state-layer', style.iconButton]"
    :data-color="color"
    :data-size="size"
    :data-shape="shape"
    :data-width="width"
    :data-pressed="!disabled && pressed ? 'true' : 'false'"
    :data-toggleable="toggleable ? 'true' : 'false'"
    :href="props.href ? props.href : null"
    :disabled="disabled ? '' : undefined"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onLostPointerCapture"
  >
    <Icon v-if="props.icon" :name="props.icon" :class="[style.icon]" :disabled="disabled" />
    <slot name="default" :disabled="disabled" />
  </component>
</template>
