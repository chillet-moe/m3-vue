<script setup lang="ts">
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressedState } from '@/composables/pressedState';
import { computed, inject, unref } from 'vue';

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

const toggleable = computed(() => props.toggleable ?? unref(context?.toggleable) ?? false);
const color = computed(() => props.color ?? unref(context?.color) ?? 'filled');
const size = computed(() => props.size ?? unref(context?.size) ?? 'small');
const shape = computed(() => props.shape ?? unref(context?.shape) ?? 'rounded');
const disabled = computed(() => props.disabled ?? unref(context?.disabled) ?? false);

const { tag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: computed(() => (toggleable.value ? 'label' : 'button')),
  href: computed(() => props.href),
  disabled,
});

const { pressed, onPointerDown, onPointerUp, onPointerCancel } = usePressedState();

const guardDisabledInteraction = (event: Event) => {
  if (!disabled.value) {
    return false;
  }

  // Guard all synthetic pressed-state handlers for label/anchor render paths.
  event.preventDefault();
  event.stopPropagation();
  return true;
};

const handlePointerDown = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerDown(event);
};

const handlePointerUp = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerUp(event);
};

const handlePointerCancel = (event: PointerEvent) => {
  if (guardDisabledInteraction(event)) return;
  onPointerCancel(event);
};

const handleClick = (event: MouseEvent) => {
  guardDisabledInteraction(event);
};

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
    :class="['m3-state-layer', 'm3-button']"
    data-scope="button"
    data-part="root"
    :data-color="color"
    :data-size="size"
    :data-shape="shape"
    :data-pressed="!disabled && pressed ? 'true' : 'false'"
    :data-toggleable="toggleable ? 'true' : 'false'"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="tabIndex"
    :type="type"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
  >
    <Icon
      v-if="props.leadingIcon"
      :name="props.leadingIcon"
      :class="['m3-button-leading', 'm3-button-icon']"
      data-scope="button"
      data-part="leading"
      :disabled="disabled"
    />
    <slot v-else name="leading" :disabled="disabled" />

    <slot name="default" :disabled="disabled" />

    <Icon
      v-if="props.trailingIcon"
      :name="props.trailingIcon"
      :class="['m3-button-trailing', 'm3-button-icon']"
      data-scope="button"
      data-part="trailing"
      :disabled="disabled"
    />
    <slot v-else name="trailing" :disabled="disabled" />
  </component>
</template>

<style src="./Button.css"></style>
