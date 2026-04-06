<script setup lang="ts">
import { computed, useId, useSlots } from 'vue';

export type MenuItemProps = {
  /** Disables item interaction. */
  disabled?: boolean;

  /** Marks item as selected/active. */
  selected?: boolean;

  /** Marks the item as a submenu trigger for future nested menus. */
  submenu?: boolean;

  /** Current open state of the submenu trigger, if applicable. */
  submenuOpen?: boolean;
};

const { disabled = false, selected = false, submenu = false, submenuOpen = false } = defineProps<MenuItemProps>();

const slots = useSlots();

defineSlots<{
  /** Optional leading content, such as an icon. */
  leading(props: { disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Main menu item text. */
  default(props: { disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional trailing icon content. */
  trailing(props: { disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional badge content. */
  badge(props: { disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional trailing supporting text. */
  trailingText(props: { disabled: boolean; selected: boolean; submenu: boolean }): any;

  /** Optional supporting text shown below the main label. */
  supporting(props: { disabled: boolean; selected: boolean; submenu: boolean }): any;
}>();

const supportingId = `menu-item-supporting-${useId()}`;

const slotProps = computed(() => ({
  disabled,
  selected,
  submenu,
}));

const hasLeading = computed(() => Boolean(slots.leading));
const hasSupporting = computed(() => Boolean(slots.supporting));
const hasTrailing = computed(() => Boolean(slots.trailing));
const hasBadge = computed(() => Boolean(slots.badge));
const hasTrailingText = computed(() => Boolean(slots.trailingText));
const hasSuffix = computed(() => hasTrailing.value || hasBadge.value || hasTrailingText.value);
</script>

<template>
  <button
    type="button"
    role="menuitem"
    :disabled="disabled"
    :data-selected="selected ? 'true' : undefined"
    :data-has-supporting="hasSupporting ? 'true' : undefined"
    :data-submenu="submenu ? 'true' : undefined"
    :aria-haspopup="submenu ? 'menu' : undefined"
    :aria-expanded="submenu ? String(submenuOpen) : undefined"
    :aria-describedby="hasSupporting ? supportingId : undefined"
    :class="['state-layer', 'm3-menu-item']"
  >
    <span v-if="hasLeading" class="m3-menu-item-leading">
      <slot name="leading" v-bind="slotProps" />
    </span>

    <span class="m3-menu-item-content">
      <span class="m3-menu-item-label">
        <slot v-bind="slotProps" />
      </span>

      <span v-if="hasSupporting" :id="supportingId" class="m3-menu-item-supporting">
        <slot name="supporting" v-bind="slotProps" />
      </span>
    </span>

    <span v-if="hasSuffix" class="m3-menu-item-suffix">
      <span v-if="hasTrailing" class="m3-menu-item-trailing">
        <slot name="trailing" v-bind="slotProps" />
      </span>

      <span v-if="hasBadge" class="m3-menu-item-badge">
        <slot name="badge" v-bind="slotProps" />
      </span>

      <span v-if="hasTrailingText" class="m3-menu-item-trailing-text">
        <slot name="trailingText" v-bind="slotProps" />
      </span>
    </span>
  </button>
</template>

<style src="./MenuItem.css"></style>
