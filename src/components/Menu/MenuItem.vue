<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { isHTMLElement, isHTMLTag } from '@/internal/elementEnvironment';
import { vStateLayer } from '@/components/StateLayer/state-layer';

import { useLinkTag } from '@/composables/useLinkTag';
import { computed, inject, useId } from 'vue';
import { menuItemOwnerContextKey, menuSelectionContextKey } from './MenuContext';
import type { MenuItemValue } from './MenuTypes';

export type MenuItemProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Row size; inherits the nearest row size or defaults to medium. */
  size?: RowSize;
  /** Optional value that participates in Menu selection state. */
  value?: MenuItemValue;

  /** Optional href. When provided, the item renders as an anchor. */
  href?: string;

  /** Plain text shown when the default slot is omitted. */
  label?: string;

  /** Disables item interaction. */
  disabled?: boolean;

  /** Whether selecting this item should close the menu chain. Ignored for submenu triggers. */
  closeOnSelect?: boolean;

  /** Marks item as selected/active. */
  selected?: boolean;

  /** Accessible menu item role for selectable items. */
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' | 'option';

  /** Checked state for radio/checkbox menu items. */
  checked?: boolean;

  /** Marks the item as a submenu trigger for future nested menus. */
  submenu?: boolean;

  /** Current open state of the submenu trigger, if applicable. */
  submenuOpen?: boolean;
};

const {
  shape: shapeProp,
  size = undefined,
  value = undefined,
  href = undefined,
  label,
  disabled = false,
  closeOnSelect = true,
  selected = false,
  role = undefined,
  checked = false,
  submenu = false,
  submenuOpen = false,
} = defineProps<MenuItemProps>();

const menuItemOwner = inject(menuItemOwnerContextKey, null);
const menuSelection = inject(menuSelectionContextKey, null);

type MenuItemSlotProps = { checked: boolean; disabled: boolean; selected: boolean; submenu: boolean };

defineSlots<{
  /** Optional leading content, such as an icon. */
  leading(props: MenuItemSlotProps): any;

  /** Main menu item text. */
  default(props: MenuItemSlotProps): any;

  /** Optional trailing icon content. */
  trailing(props: MenuItemSlotProps): any;

  /** Optional badge content. */
  badge(props: MenuItemSlotProps): any;

  /** Optional trailing supporting text. */
  trailingText(props: MenuItemSlotProps): any;

  /** Optional supporting text shown below the main label. */
  supporting(props: MenuItemSlotProps): any;
}>();

const supportingId = `menu-item-supporting-${useId()}`;

const selectionValue = computed(() => (submenu ? undefined : value));
const menuSelected = computed(() => {
  const itemValue = selectionValue.value;
  return itemValue === undefined ? undefined : menuSelection?.isSelected(itemValue);
});

const resolvedRole = computed(() => {
  if (role) {
    return role;
  }

  if (selectionValue.value === undefined || !menuSelection) {
    return 'menuitem';
  }

  return menuSelection.multiple() ? 'menuitemcheckbox' : 'menuitemradio';
});

const link = useLinkTag({
  defaultTag: 'button',
  href: () => href,
  disabled: () => disabled,
  ariaDisabledMode: 'non-button',
});

const slotProps = computed(() => {
  const selection = menuSelected.value;
  return {
    checked: selection ?? checked,
    disabled,
    selected: selection ?? selected,
    submenu,
  };
});

function guardDisabledInteraction(event: Event) {
  if (!disabled) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  return true;
}

function handleClick(event: MouseEvent) {
  if (guardDisabledInteraction(event)) {
    return;
  }

  const itemValue = selectionValue.value;
  if (itemValue !== undefined) menuSelection?.toggle(itemValue);
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

const rowSize = provideRowSize(() => size);
const shape = useShape(() => shapeProp);
</script>

<template>
  <component
    v-state-layer
    :is="link.tag"
    :role="resolvedRole"
    :href="link.href"
    :disabled="link.nativeDisabled"
    :aria-disabled="link.ariaDisabled"
    :tabindex="link.tabIndex"
    :type="link.type"
    :data-selected="slotProps.selected ? 'true' : undefined"
    :data-menu-owner="menuItemOwner?.id"
    :data-close-on-select="closeOnSelect ? undefined : 'false'"
    :data-submenu="submenu ? 'true' : undefined"
    :aria-haspopup="submenu ? 'menu' : undefined"
    :aria-expanded="submenu ? (submenuOpen ? 'true' : 'false') : undefined"
    :aria-checked="
      resolvedRole === 'menuitemradio' || resolvedRole === 'menuitemcheckbox' ? slotProps.checked : undefined
    "
    :aria-selected="resolvedRole === 'option' ? slotProps.selected : undefined"
    :aria-describedby="$slots.supporting ? supportingId : undefined"
    class="m3-state-layer m3-menu-item m3-row-size"
    :data-size="rowSize"
    data-scope="menu-item"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span v-if="$slots.leading" class="m3-menu-item-leading" data-scope="menu-item" data-part="leading">
      <slot name="leading" v-bind="slotProps" />
    </span>

    <span
      class="m3-menu-item-content"
      :class="{ 'm3-menu-item-label': !$slots.default && !$slots.supporting }"
      data-scope="menu-item"
      data-part="content"
    >
      <template v-if="$slots.default || $slots.supporting">
        <span class="m3-menu-item-label" data-scope="menu-item" data-part="label">
          <slot v-bind="slotProps">{{ label }}</slot>
        </span>
        <span
          v-if="$slots.supporting"
          :id="supportingId"
          class="m3-menu-item-supporting"
          data-scope="menu-item"
          data-part="supporting"
        >
          <slot name="supporting" v-bind="slotProps" />
        </span>
      </template>
      <template v-else>{{ label }}</template>
    </span>

    <span
      v-if="$slots.trailing || $slots.badge || $slots.trailingText"
      class="m3-menu-item-suffix"
      data-scope="menu-item"
      data-part="suffix"
    >
      <span v-if="$slots.trailing" class="m3-menu-item-trailing" data-scope="menu-item" data-part="trailing">
        <slot name="trailing" v-bind="slotProps" />
      </span>

      <span v-if="$slots.badge" class="m3-menu-item-badge" data-scope="menu-item" data-part="badge">
        <slot name="badge" v-bind="slotProps" />
      </span>

      <span
        v-if="$slots.trailingText"
        class="m3-menu-item-trailing-text"
        data-scope="menu-item"
        data-part="trailing-text"
      >
        <slot name="trailingText" v-bind="slotProps" />
      </span>
    </span>
  </component>
</template>

<style src="./MenuItem.css"></style>
