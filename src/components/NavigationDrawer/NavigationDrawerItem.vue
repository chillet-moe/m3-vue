<script setup lang="ts">
import { vFocusRing } from '@/directives/FocusRing';
import { useShape, type M3Shape } from '@/styles/shape';
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { Icon } from '@/components/Icon';
import { useNavigationItem } from '@/composables/useNavigationItem';
import vTooltip from '@/directives/Tooltip/vTooltip';
import type { VTooltipBinding } from '@/directives/Tooltip/types';
import { computed, inject, unref } from 'vue';
import { navigationDrawerContextKey, navigationDrawerShapeContextKey } from './NavigationDrawerContext';
import '@/styles/icon-morph.css';

export type NavigationDrawerItemShape = M3Shape;

export type NavigationDrawerItemProps = {
  /** Row size; inherits the nearest row size or defaults to medium. */
  size?: RowSize;
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

const slots = defineSlots<{
  /** Label content. */
  default?(props: { selected: boolean; disabled: boolean; iconOnly: boolean }): any;

  /** Icon content. */
  icon?(props: { selected: boolean; disabled: boolean; iconOnly: boolean }): any;

  /** Optional trailing content. */
  trailing?(props: { selected: boolean; disabled: boolean; iconOnly: boolean }): any;
}>();

const drawer = inject(navigationDrawerContextKey, null);
const globalShape = inject(navigationDrawerShapeContextKey, undefined);

const isIconOnly = computed(() => drawer?.iconOnly.value ?? false);
const resolvedShape = useShape(() => props.shape ?? drawer?.shape.value ?? unref(globalShape?.shape));
const { mergedDisabled, isSelected, link, handleClick, handleKeydown } = useNavigationItem({
  context: drawer,
  value: () => props.value,
  href: () => props.href,
  disabled: () => props.disabled,
  selected: () => props.selected,
});

function resolveAriaLabel() {
  if (props.ariaLabel) return props.ariaLabel;
  if (isIconOnly.value && props.label) return props.label;
  return props.label || slots.default ? undefined : (props.label ?? props.value);
}

const slotProps = computed(() => ({
  selected: isSelected.value,
  disabled: mergedDisabled.value,
  iconOnly: isIconOnly.value,
}));

const tooltip = computed<VTooltipBinding>(() => {
  if (!isIconOnly.value) return undefined;

  const content = props.label ?? props.ariaLabel;
  if (!content) return undefined;

  return {
    content,
    placement: 'end',
    interactive: false,
  };
});
const rowSize = provideRowSize(() => props.size);
</script>

<template>
  <component
    v-state-layer
    :is="link.tag"
    :href="link.href"
    :disabled="link.nativeDisabled"
    :aria-disabled="link.ariaDisabled"
    :aria-current="isSelected ? 'page' : undefined"
    :aria-label="resolveAriaLabel()"
    :tabindex="link.tabIndex"
    :type="link.type"
    v-tooltip="tooltip"
    :data-size="rowSize"
    v-focus-ring
    class="m3-row-size m3-navigation-drawer-item m3-state-layer m3-morph-host"
    data-scope="navigation-drawer-item"
    data-part="root"
    :data-item-value="props.value"
    :data-shape="resolvedShape"
    data-m3-shape
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
      v-if="props.label || slots.default"
      class="m3-navigation-drawer-item-label m3-text-morph"
      data-scope="navigation-drawer-item"
      data-part="label"
    >
      <slot v-bind="slotProps">{{ props.label }}</slot>
    </span>

    <span
      v-if="slots.trailing"
      class="m3-navigation-drawer-item-trailing"
      data-scope="navigation-drawer-item"
      data-part="trailing"
    >
      <slot name="trailing" v-bind="slotProps" />
    </span>
  </component>
</template>

<style src="./NavigationDrawerItem.css"></style>
