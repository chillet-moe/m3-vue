<script setup lang="ts">
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressShapeMorph } from '@/composables/usePressShapeMorph';
import { useActionTitleTooltip } from '@/composables/useActionTitleTooltip';
import { computed, inject, mergeProps, unref } from 'vue';

import { buttonContextKey } from '@/components/Button/ButtonContext.ts';
import { Icon } from '@/components/Icon';

defineOptions({
  inheritAttrs: false,
});

export type ButtonVariant = 'text' | 'outlined' | 'tonal' | 'filled' | 'elevated';

export type ButtonProps = {
  /** Whether the button is toggleable (like a checkbox).
   * When true, the button must contain an input element of type checkbox or radio.
   */
  toggleable?: boolean;

  /** The visual emphasis of the button. */
  variant?: ButtonVariant;

  /** The size of the button. */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

  /** The shape of the button. */
  shape?: 'rounded' | 'square';

  /** Whether pressed-state shape morphing is enabled. */
  pressShapeMorph?: boolean;

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
  pressShapeMorph: undefined,
  disabled: undefined,
});

const context = inject(buttonContextKey, undefined);

const toggleable = computed(() => props.toggleable ?? unref(context?.toggleable) ?? false);
const variant = computed(() => props.variant ?? unref(context?.variant) ?? 'text');
const size = computed(() => props.size ?? unref(context?.size) ?? 'small');
const shape = computed(() => props.shape ?? unref(context?.shape) ?? 'rounded');
const pressShapeMorph = computed(() => props.pressShapeMorph ?? unref(context?.pressShapeMorph) ?? true);
const disabled = computed(() => props.disabled ?? unref(context?.disabled) ?? false);

const { tag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: computed(() => (toggleable.value ? 'label' : 'button')),
  href: computed(() => props.href),
  disabled,
});

const { pressShapeMorphAttrs } = usePressShapeMorph({
  enabled: pressShapeMorph,
  disabled,
});

const { rootAttrs, rootRef } = useActionTitleTooltip();
const rootProps = computed(() => mergeProps(pressShapeMorphAttrs.value, rootAttrs.value));

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
    :data-variant="variant"
    :data-size="size"
    :data-shape="shape"
    :data-press-shape-morph="pressShapeMorph ? 'true' : 'false'"
    :data-toggleable="toggleable ? 'true' : 'false'"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="tabIndex"
    :type="type"
    ref="rootRef"
    v-bind="rootProps"
  >
    <span
      v-if="props.leadingIcon || slots.leading"
      :class="['m3-button-leading', 'm3-button-icon']"
      data-scope="button"
      data-part="leading"
    >
      <Icon v-if="props.leadingIcon" :name="props.leadingIcon" :disabled="disabled" />
      <slot v-else name="leading" :disabled="disabled" />
    </span>

    <span v-if="slots.default" data-part="text">
      <slot name="default" :disabled="disabled" />
    </span>

    <span
      v-if="props.trailingIcon || slots.trailing"
      :class="['m3-button-trailing', 'm3-button-icon']"
      data-scope="button"
      data-part="trailing"
    >
      <Icon v-if="props.trailingIcon" :name="props.trailingIcon" :disabled="disabled" />
      <slot v-else name="trailing" :disabled="disabled" />
    </span>
  </component>
</template>

<style src="./Button.css"></style>
