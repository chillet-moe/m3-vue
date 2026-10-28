<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { Icon } from '@/components/Icon';
import { useNavigationItem } from '@/composables/useNavigationItem';
import { computed, inject, useSlots } from 'vue';
import { navigationRailContextKey } from './NavigationRailContext';

export type NavigationRailItemProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Row size; inherits the nearest row size or defaults to medium. */
  size?: RowSize;
  /** Destination value used by NavigationRail v-model. */
  value?: string;

  /** Default icon name (Material Symbols Outlined). */
  icon?: string;

  /** Fallback label text when default slot is not provided. */
  label?: string;

  /** Optional href. When provided, the item renders as an anchor. */
  href?: string;

  /** Disable interaction. */
  disabled?: boolean;

  /** Force selected state when not controlled by NavigationRail. */
  selected?: boolean;

  /** Accessible label. Useful when label text is omitted visually. */
  ariaLabel?: string;
};

const props = withDefaults(defineProps<NavigationRailItemProps>(), {
  value: undefined,
  icon: undefined,
  label: undefined,
  href: undefined,
  disabled: false,
  selected: undefined,
  ariaLabel: undefined,
});

defineSlots<{
  /** Label content. */
  default(props: { selected: boolean; disabled: boolean; state: 'collapsed' | 'expanded' }): any;

  /** Icon content. */
  icon(props: { selected: boolean; disabled: boolean; state: 'collapsed' | 'expanded' }): any;
}>();

const slots = useSlots();
const rail = inject(navigationRailContextKey, null);

const railState = computed<'collapsed' | 'expanded'>(() => rail?.state.value ?? 'collapsed');
const isExpanded = computed(() => railState.value === 'expanded');
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
  context: rail,
  value: () => props.value,
  href: () => props.href,
  disabled: () => props.disabled,
  selected: () => props.selected,
});

const hasLabel = computed(() => Boolean(props.label || slots.default));

const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }

  if (hasLabel.value) {
    return undefined;
  }

  return props.label ?? props.value;
});

const slotProps = computed(() => ({
  selected: isSelected.value,
  disabled: mergedDisabled.value,
  state: railState.value,
}));
const rowSize = provideRowSize(() => props.size);
const shape = useShape(() => props.shape);
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
    :data-size="rowSize"
    class="m3-row-size m3-navigation-rail-item m3-morph-host"
    data-scope="navigation-rail-item"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    data-state-layer-hover-target
    :data-item-value="props.value"
    :data-state="railState"
    :data-selected="isSelected ? 'true' : undefined"
    :data-disabled="mergedDisabled ? 'true' : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span class="m3-navigation-rail-item-indicator" data-scope="navigation-rail-item" data-part="indicator">
      <span
        v-state-layer
        aria-hidden="true"
        class="m3-navigation-rail-item-state-layer m3-state-layer"
        data-state-layer-hover-from="target"
      />

      <span class="m3-navigation-rail-item-icon-layer" data-scope="navigation-rail-item" data-part="icon-layer">
        <span class="m3-navigation-rail-item-icon" data-scope="navigation-rail-item" data-part="icon">
          <slot name="icon" v-bind="slotProps">
            <Icon v-if="props.icon" :name="props.icon" class="m3-icon-morph" />
          </slot>
        </span>
      </span>

      <span
        v-if="hasLabel"
        class="m3-navigation-rail-item-label m3-navigation-rail-item-label-expanded m3-text-morph"
        data-scope="navigation-rail-item"
        data-part="label"
        :aria-hidden="isExpanded ? undefined : 'true'"
      >
        <slot v-bind="slotProps">{{ props.label }}</slot>
      </span>
    </span>

    <span
      v-if="hasLabel"
      class="m3-navigation-rail-item-label m3-navigation-rail-item-label-collapsed m3-text-morph"
      data-scope="navigation-rail-item"
      data-part="label"
      :aria-hidden="isExpanded ? 'true' : undefined"
    >
      <slot v-bind="slotProps">{{ props.label }}</slot>
    </span>
  </component>
</template>

<style src="./NavigationRailItem.css"></style>
