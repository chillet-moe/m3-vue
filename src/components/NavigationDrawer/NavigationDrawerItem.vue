<script setup lang="ts">
import { Icon } from '@/components/Icon';
import { useNavigationItem } from '@/composables/useNavigationItem';
import vTooltip from '@/directives/Tooltip/vTooltip';
import type { VTooltipBinding } from '@/directives/Tooltip/types';
import { computed, inject, unref, useSlots } from 'vue';
import { navigationDrawerContextKey, navigationDrawerShapeContextKey } from './NavigationDrawerContext';

export type NavigationDrawerItemShape = 'rounded' | 'square';

export type NavigationDrawerItemProps = {
  /** Destination value used by NavigationDrawer v-model. */
  value?: string;

  /** Default icon name (Material Symbols Outlined). */
  icon?: string;

  /** Fallback label text when default slot is not provided. */
  label?: string;

  /** Optional href. When provided, the item renders as an anchor. */
  href?: string;

  /** The shape of the item. */
  shape?: NavigationDrawerItemShape;

  /** Disable interaction. */
  disabled?: boolean;

  /** Force selected state when not controlled by NavigationDrawer. */
  selected?: boolean;

  /** Accessible label. Useful when label text is omitted visually. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<NavigationDrawerItemProps>(), {
  value: undefined,
  icon: undefined,
  label: undefined,
  href: undefined,
  shape: undefined,
  disabled: false,
  selected: undefined,
  ariaLabel: undefined,
});

defineSlots<{
  /** Label content. */
  default(props: { selected: boolean; disabled: boolean; iconOnly: boolean }): any;

  /** Icon content. */
  icon(props: { selected: boolean; disabled: boolean; iconOnly: boolean }): any;

  /** Optional trailing content. */
  trailing(props: { selected: boolean; disabled: boolean; iconOnly: boolean }): any;
}>();

const slots = useSlots();
const drawer = inject(navigationDrawerContextKey, null);
const globalShape = inject(navigationDrawerShapeContextKey, undefined);

const isIconOnly = computed(() => drawer?.iconOnly.value ?? false);
const resolvedShape = computed(() => props.shape ?? drawer?.shape.value ?? unref(globalShape?.shape) ?? 'rounded');
const {
  mergedDisabled,
  isSelected,
  tag,
  nativeDisabled,
  ariaDisabled,
  href,
  tabIndex,
  type,
  handleClick,
  handleKeydown,
} = useNavigationItem({
  context: drawer,
  value: () => props.value,
  href: () => props.href,
  disabled: () => props.disabled,
  selected: () => props.selected,
});

const hasLabel = computed(() => Boolean(props.label || slots.default));
const hasTrailing = computed(() => Boolean(slots.trailing));

const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }

  if (isIconOnly.value && props.label) {
    return props.label;
  }

  if (hasLabel.value) {
    return undefined;
  }

  return props.label ?? props.value;
});

const slotProps = computed(() => ({
  selected: isSelected.value,
  disabled: mergedDisabled.value,
  iconOnly: isIconOnly.value,
}));

const tooltipContent = computed(() => props.label ?? props.ariaLabel);
const tooltip = computed<VTooltipBinding>(() => {
  if (!isIconOnly.value || !tooltipContent.value) {
    return undefined;
  }

  return {
    content: tooltipContent.value,
    placement: 'end',
    interactive: false,
  };
});
</script>

<template>
  <component
    :is="tag"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :aria-current="isSelected ? 'page' : undefined"
    :aria-label="resolvedAriaLabel"
    :tabindex="tabIndex"
    :type="type"
    v-tooltip="tooltip"
    class="m3-navigation-drawer-item m3-state-layer m3-morph-host"
    data-scope="navigation-drawer-item"
    data-part="root"
    :data-item-value="props.value"
    :data-shape="resolvedShape"
    :data-selected="isSelected ? 'true' : undefined"
    :data-disabled="mergedDisabled ? 'true' : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span
      v-if="props.icon || $slots.icon"
      class="m3-navigation-drawer-item-leading"
      data-scope="navigation-drawer-item"
      data-part="leading"
    >
      <slot name="icon" v-bind="slotProps">
        <Icon v-if="props.icon" :name="props.icon" class="m3-navigation-drawer-item-icon m3-icon-morph" />
      </slot>
    </span>

    <span
      v-if="hasLabel"
      class="m3-navigation-drawer-item-label m3-text-morph"
      data-scope="navigation-drawer-item"
      data-part="label"
    >
      <slot v-bind="slotProps">{{ props.label }}</slot>
    </span>

    <span
      v-if="hasTrailing"
      class="m3-navigation-drawer-item-trailing"
      data-scope="navigation-drawer-item"
      data-part="trailing"
    >
      <slot name="trailing" v-bind="slotProps" />
    </span>
  </component>
</template>

<style src="./NavigationDrawerItem.css"></style>
