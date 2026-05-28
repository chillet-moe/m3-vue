<script setup lang="ts">
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressShapeMorph } from '@/composables/usePressShapeMorph';
import { useActionTitleTooltip } from '@/composables/useActionTitleTooltip';
import { computed, inject, mergeProps, unref } from 'vue';
import { Icon } from '@/components/Icon';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext.ts';

defineOptions({
  inheritAttrs: false,
});

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

const { tag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: computed(() => (toggleable.value ? 'label' : 'button')),
  href: computed(() => props.href),
  disabled,
});

const { pressShapeMorphAttrs } = usePressShapeMorph({ disabled });

const { rootAttrs, rootRef } = useActionTitleTooltip({ ariaLabelFallback: true });
const rootProps = computed(() => mergeProps(pressShapeMorphAttrs.value, rootAttrs.value));

const slots = defineSlots<{
  /** Default slot for the main content of the icon button. Receives `disabled` as a prop. */
  default(props: { disabled: boolean }): any;
}>();
</script>

<template>
  <component
    :is="tag"
    :class="['m3-state-layer', 'm3-icon-button']"
    data-scope="icon-button"
    data-part="root"
    :data-color="color"
    :data-size="size"
    :data-shape="shape"
    :data-width="width"
    :data-toggleable="toggleable ? 'true' : 'false'"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="tabIndex"
    :type="type"
    ref="rootRef"
    v-bind="rootProps"
  >
    <Icon
      v-if="props.icon"
      :name="props.icon"
      :class="['m3-icon-button-icon']"
      data-scope="icon-button"
      data-part="icon"
      :disabled="disabled"
    />
    <slot name="default" :disabled="disabled" />
  </component>
</template>

<style src="./IconButton.css"></style>
