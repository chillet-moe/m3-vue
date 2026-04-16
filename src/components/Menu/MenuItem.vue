<script setup lang="ts">
import { computed, inject, useId, useSlots } from 'vue';
import { menuContextKey, menuSelectionContextKey } from './MenuContext';
import type { MenuItemValue } from './MenuTypes';

export type MenuItemProps = {
  /** Optional value that participates in Menu selection state. */
  value?: MenuItemValue;

  /** Optional href. When provided, the item renders as an anchor. */
  href?: string;

  /** Disables item interaction. */
  disabled?: boolean;

  /** Whether selecting this item should close the menu chain. Ignored for submenu triggers. */
  closeOnSelect?: boolean;

  /** Marks item as selected/active. */
  selected?: boolean;

  /** Accessible menu item role for selectable items. */
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';

  /** Checked state for radio/checkbox menu items. */
  checked?: boolean;

  /** Marks the item as a submenu trigger for future nested menus. */
  submenu?: boolean;

  /** Current open state of the submenu trigger, if applicable. */
  submenuOpen?: boolean;
};

const {
  value = undefined,
  href = undefined,
  disabled = false,
  closeOnSelect = true,
  selected = false,
  role = undefined,
  checked = false,
  submenu = false,
  submenuOpen = false,
} = defineProps<MenuItemProps>();

const slots = useSlots();
const menuContext = inject(menuContextKey, null);
const menuSelection = inject(menuSelectionContextKey, null);

defineSlots<{
  /** Optional leading content, such as an icon. */
  leading(props: { checked: boolean; disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Main menu item text. */
  default(props: { checked: boolean; disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional trailing icon content. */
  trailing(props: { checked: boolean; disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional badge content. */
  badge(props: { checked: boolean; disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional trailing supporting text. */
  trailingText(props: { checked: boolean; disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional supporting text shown below the main label. */
  supporting(props: { checked: boolean; disabled: boolean; selected: boolean; submenu: boolean }): any;
}>();

const supportingId = `menu-item-supporting-${useId()}`;

const usesMenuSelection = computed(() => {
  return value !== undefined && !submenu;
});

const resolvedSelected = computed(() => {
  if (!usesMenuSelection.value || !menuSelection || value === undefined) {
    return selected;
  }

  return menuSelection.isSelected(value);
});

const resolvedChecked = computed(() => {
  if (!usesMenuSelection.value || !menuSelection || value === undefined) {
    return checked;
  }

  return menuSelection.isSelected(value);
});

const resolvedRole = computed(() => {
  if (role) {
    return role;
  }

  if (!usesMenuSelection.value || !menuSelection) {
    return 'menuitem';
  }

  return menuSelection.multiple() ? 'menuitemcheckbox' : 'menuitemradio';
});

const tag = computed(() => {
  if (href) {
    return 'a';
  }

  return 'button';
});

const isButtonTag = computed(() => tag.value === 'button');
const isAnchorTag = computed(() => tag.value === 'a');
const nativeDisabled = computed(() => (isButtonTag.value ? disabled : undefined));
const ariaDisabled = computed(() => (disabled && !isButtonTag.value ? 'true' : undefined));
const resolvedHref = computed(() => {
  if (!href) {
    return undefined;
  }

  return disabled && isAnchorTag.value ? undefined : href;
});
const tabIndex = computed(() => (disabled && !isButtonTag.value ? -1 : undefined));
const type = computed(() => (isButtonTag.value ? 'button' : undefined));

const slotProps = computed(() => ({
  checked: resolvedChecked.value,
  disabled,
  selected: resolvedSelected.value,
  submenu,
}));

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

  if (!usesMenuSelection.value || !menuSelection || value === undefined) {
    return;
  }

  menuSelection.toggle(value);
}

function handleKeydown(event: KeyboardEvent) {
  if (guardDisabledInteraction(event)) {
    return;
  }

  if (event.key !== ' ') {
    return;
  }

  const currentTarget = event.currentTarget;

  if (!(currentTarget instanceof HTMLElement) || currentTarget instanceof HTMLButtonElement) {
    return;
  }

  event.preventDefault();
  currentTarget.click();
}

function hasLeading() {
  return Boolean(slots.leading);
}

function hasSupporting() {
  return Boolean(slots.supporting);
}

function hasTrailing() {
  return Boolean(slots.trailing);
}

function hasBadge() {
  return Boolean(slots.badge);
}

function hasTrailingText() {
  return Boolean(slots.trailingText);
}

function hasSuffix() {
  return hasTrailing() || hasBadge() || hasTrailingText();
}
</script>

<template>
  <component
    :is="tag"
    :role="resolvedRole"
    :href="resolvedHref"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :tabindex="tabIndex"
    :type="type"
    :data-selected="resolvedSelected ? 'true' : undefined"
    :data-menu-owner="menuContext?.id"
    :data-has-supporting="hasSupporting() ? 'true' : undefined"
    :data-close-on-select="closeOnSelect ? undefined : 'false'"
    :data-submenu="submenu ? 'true' : undefined"
    :aria-haspopup="submenu ? 'menu' : undefined"
    :aria-expanded="submenu ? (submenuOpen ? 'true' : 'false') : undefined"
    :aria-checked="resolvedRole === 'menuitem' ? undefined : resolvedChecked ? 'true' : 'false'"
    :aria-describedby="hasSupporting() ? supportingId : undefined"
    :class="['state-layer', 'm3-menu-item']"
    data-scope="menu-item"
    data-part="root"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span v-if="hasLeading()" class="m3-menu-item-leading" data-scope="menu-item" data-part="leading">
      <slot name="leading" v-bind="slotProps" />
    </span>

    <span class="m3-menu-item-content" data-scope="menu-item" data-part="content">
      <span class="m3-menu-item-label" data-scope="menu-item" data-part="label">
        <slot v-bind="slotProps" />
      </span>

      <span
        v-if="hasSupporting()"
        :id="supportingId"
        class="m3-menu-item-supporting"
        data-scope="menu-item"
        data-part="supporting"
      >
        <slot name="supporting" v-bind="slotProps" />
      </span>
    </span>

    <span v-if="hasSuffix()" class="m3-menu-item-suffix" data-scope="menu-item" data-part="suffix">
      <span v-if="hasTrailing()" class="m3-menu-item-trailing" data-scope="menu-item" data-part="trailing">
        <slot name="trailing" v-bind="slotProps" />
      </span>

      <span v-if="hasBadge()" class="m3-menu-item-badge" data-scope="menu-item" data-part="badge">
        <slot name="badge" v-bind="slotProps" />
      </span>

      <span
        v-if="hasTrailingText()"
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
