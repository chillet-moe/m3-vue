<script setup lang="ts">
import { Icon } from '@/components/Icon';
import { useLinkTag } from '@/composables/useLinkTag';
import vTooltip from '@/directives/Tooltip/vTooltip';
import type { VTooltipBinding } from '@/directives/Tooltip/types';
import { computed, inject, useSlots } from 'vue';
import { navigationDrawerContextKey } from './NavigationDrawerContext';

export type NavigationDrawerItemProps = {
  /** Destination value used by NavigationDrawer v-model. */
  value?: string;

  /** Default icon name (Material Symbols Outlined). */
  icon?: string;

  /** Fallback label text when default slot is not provided. */
  label?: string;

  /** Optional href. When provided, the item renders as an anchor. */
  href?: string;

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

const isIconOnly = computed(() => drawer?.iconOnly.value ?? false);
const mergedDisabled = computed(() => props.disabled || drawer?.disabled.value || false);
const hasValue = computed(() => props.value !== undefined);

const selectedFromDrawer = computed(() => {
  if (!drawer || !hasValue.value || props.value === undefined) {
    return false;
  }

  return drawer.value.value === props.value;
});

const isSelected = computed(() => props.selected ?? selectedFromDrawer.value);
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

const { tag, isAnchorTag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: 'button',
  href: computed(() => props.href),
  disabled: mergedDisabled,
  ariaDisabledMode: 'non-button',
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

const guardDisabledInteraction = (event: Event) => {
  if (!mergedDisabled.value) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  return true;
};

const activate = () => {
  if (!drawer || !hasValue.value || props.value === undefined) {
    return;
  }

  drawer.activate(props.value);
};

const handleClick = (event: MouseEvent) => {
  if (guardDisabledInteraction(event)) {
    return;
  }

  activate();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (guardDisabledInteraction(event)) {
    return;
  }

  if (event.key !== ' ') {
    return;
  }

  const currentTarget = event.currentTarget;

  if (!(currentTarget instanceof HTMLElement) || !isAnchorTag.value) {
    return;
  }

  event.preventDefault();
  currentTarget.click();
};
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
