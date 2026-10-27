<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { computed, mergeProps } from 'vue';

import { useActionTitleTooltip } from '@/composables/useActionTitleTooltip';
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressShapeMorph } from '@/composables/usePressShapeMorph';
import { Icon } from '@/components/Icon';

defineOptions({
  inheritAttrs: false,
});

export type FloatingActionButtonProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** The color style of the FAB. */
  color?: 'primary' | 'secondary' | 'tertiary' | 'primary-container' | 'secondary-container' | 'tertiary-container';

  /** The size of the FAB. */
  size?: 'regular' | 'medium' | 'large';

  /** The href attribute. If provided, the FAB will be rendered as an anchor element. */
  href?: string;

  /** Name of the icon. */
  icon?: string;

  /** Whether the FAB is disabled. */
  disabled?: boolean;
};

const props = withDefaults(defineProps<FloatingActionButtonProps>(), {
  color: 'primary-container',
  size: 'regular',
  href: undefined,
  icon: undefined,
  disabled: false,
});

const disabled = computed(() => props.disabled);
const { tag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: 'button',
  href: computed(() => props.href),
  disabled,
});

const slots = defineSlots<{
  /** Slot for icon content. Will not be used if `icon` prop is set. */
  icon(props: { disabled: boolean }): any;

  /** Label content. When present, the FAB uses the extended layout. */
  default(props: { disabled: boolean }): any;
}>();

const hasIcon = computed(() => Boolean(props.icon || slots.icon));
const extended = computed(() => Boolean(slots.default));

const { pressShapeMorphAttrs } = usePressShapeMorph({ disabled });
const { rootAttrs, rootRef } = useActionTitleTooltip({ ariaLabelFallback: true });
const rootProps = computed(() => mergeProps(pressShapeMorphAttrs.value, rootAttrs.value));
const shape = useShape(() => props.shape);
</script>

<template>
  <component
    v-state-layer
    :is="tag"
    :class="['m3-state-layer', 'm3-fab']"
    data-scope="floating-action-button"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-color="color"
    :data-size="size"
    :data-extended="extended ? 'true' : 'false'"
    :data-disabled="disabled ? 'true' : 'false'"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="tabIndex"
    :type="type"
    ref="rootRef"
    v-bind="rootProps"
  >
    <span
      v-if="hasIcon"
      class="m3-fab-icon"
      data-scope="floating-action-button"
      data-part="icon"
      :aria-hidden="extended ? 'true' : undefined"
    >
      <Icon v-if="props.icon" :name="props.icon" />
      <slot v-else name="icon" :disabled="disabled" />
    </span>

    <span v-if="extended" class="m3-fab-label" data-scope="floating-action-button" data-part="label">
      <slot name="default" :disabled="disabled" />
    </span>
  </component>
</template>

<style src="./FloatingActionButton.css"></style>
