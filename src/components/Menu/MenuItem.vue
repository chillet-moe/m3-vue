<script setup lang="ts">
import { computed, inject, useId, useSlots } from 'vue';
import { menuContextKey } from './MenuContext';

export type MenuItemProps = {
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
  disabled = false,
  closeOnSelect = true,
  selected = false,
  role = 'menuitem',
  checked = false,
  submenu = false,
  submenuOpen = false,
} = defineProps<MenuItemProps>();

const slots = useSlots();
const menuContext = inject(menuContextKey, null);

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

const slotProps = computed(() => ({
  checked,
  disabled,
  selected,
  submenu,
}));

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
  <button
    type="button"
    :role="role"
    :disabled="disabled"
    :data-selected="selected ? 'true' : undefined"
    :data-menu-owner="menuContext?.id"
    :data-has-supporting="hasSupporting() ? 'true' : undefined"
    :data-close-on-select="closeOnSelect ? undefined : 'false'"
    :data-submenu="submenu ? 'true' : undefined"
    :aria-haspopup="submenu ? 'menu' : undefined"
    :aria-expanded="submenu ? (submenuOpen ? 'true' : 'false') : undefined"
    :aria-checked="role === 'menuitem' ? undefined : (checked ? 'true' : 'false')"
    :aria-describedby="hasSupporting() ? supportingId : undefined"
    :class="['state-layer', 'm3-menu-item']"
  >
    <span v-if="hasLeading()" class="m3-menu-item-leading">
      <slot name="leading" v-bind="slotProps" />
    </span>

    <span class="m3-menu-item-content">
      <span class="m3-menu-item-label">
        <slot v-bind="slotProps" />
      </span>

      <span v-if="hasSupporting()" :id="supportingId" class="m3-menu-item-supporting">
        <slot name="supporting" v-bind="slotProps" />
      </span>
    </span>

    <span v-if="hasSuffix()" class="m3-menu-item-suffix">
      <span v-if="hasTrailing()" class="m3-menu-item-trailing">
        <slot name="trailing" v-bind="slotProps" />
      </span>

      <span v-if="hasBadge()" class="m3-menu-item-badge">
        <slot name="badge" v-bind="slotProps" />
      </span>

      <span v-if="hasTrailingText()" class="m3-menu-item-trailing-text">
        <slot name="trailingText" v-bind="slotProps" />
      </span>
    </span>
  </button>
</template>

<style src="./MenuItem.css"></style>
