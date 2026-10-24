<script setup lang="ts">
import { isHTMLTag } from '@/internal/elementEnvironment';

import { vStateLayer } from '@/components/StateLayer/state-layer';
import { isHTMLElement } from '@/internal/elementEnvironment';

import { computed, inject, useSlots } from 'vue';

import { Icon } from '@/components/Icon';
import { useLinkTag } from '@/composables/useLinkTag';
import { usePressShapeMorph } from '@/composables/usePressShapeMorph';
import { floatingActionButtonMenuContextKey } from './FloatingActionButtonMenuContext';

export type FloatingActionButtonMenuItemProps = {
  /** Optional href. When provided, the item renders as an anchor. */
  href?: string;

  /** Name of the leading icon. */
  icon?: string;

  /** Disables item interaction. */
  disabled?: boolean;

  /** Whether activating this item should close the FAB menu. */
  closeOnSelect?: boolean;
};

const props = withDefaults(defineProps<FloatingActionButtonMenuItemProps>(), {
  href: undefined,
  icon: undefined,
  disabled: false,
  closeOnSelect: true,
});

const slots = useSlots();
const menuContext = inject(floatingActionButtonMenuContextKey, null);
const disabled = computed(() => props.disabled);

const { tag, nativeDisabled, ariaDisabled, href, tabIndex, type } = useLinkTag({
  defaultTag: 'button',
  href: computed(() => props.href),
  disabled,
  ariaDisabledMode: 'non-button',
});

const { pressShapeMorphAttrs } = usePressShapeMorph({ disabled });

defineSlots<{
  /** Optional leading content, such as an icon. Will not be used if `icon` prop is set. */
  icon(props: { disabled: boolean }): any;

  /** Main item label. */
  default(props: { disabled: boolean }): any;
}>();

function hasIcon() {
  return Boolean(props.icon || slots.icon);
}

function guardDisabledInteraction(event: Event) {
  if (!props.disabled) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  return true;
}

function handleClick(event: MouseEvent) {
  guardDisabledInteraction(event);
}

function handleKeydown(event: KeyboardEvent) {
  if (guardDisabledInteraction(event)) {
    return;
  }

  if (event.key !== ' ') {
    return;
  }

  const currentTarget = event.currentTarget;

  if (!isHTMLElement(currentTarget) || isHTMLTag(currentTarget, 'button')) {
    return;
  }

  event.preventDefault();
  currentTarget.click();
}
</script>

<template>
  <component
    v-state-layer
    :is="tag"
    role="menuitem"
    :href="href"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="tabIndex"
    :type="type"
    :data-menu-owner="menuContext?.id"
    :data-close-on-select="closeOnSelect ? undefined : 'false'"
    :class="['m3-state-layer', 'm3-fab-menu-item']"
    data-scope="floating-action-button-menu"
    data-part="item"
    @click="handleClick"
    @keydown="handleKeydown"
    v-bind="pressShapeMorphAttrs"
  >
    <span
      v-if="hasIcon()"
      class="m3-fab-menu-item-icon"
      data-scope="floating-action-button-menu"
      data-part="item-icon"
      aria-hidden="true"
    >
      <Icon v-if="props.icon" :name="props.icon" />
      <slot v-else name="icon" :disabled="disabled" />
    </span>

    <span class="m3-fab-menu-item-label" data-scope="floating-action-button-menu" data-part="item-label">
      <slot :disabled="disabled" />
    </span>
  </component>
</template>
