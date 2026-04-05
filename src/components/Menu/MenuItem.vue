<script setup lang="ts">
import style from './MenuItem.module.css';

export type MenuItemProps = {
  /** Disables item interaction. */
  disabled?: boolean;

  /** Marks item as selected/active. */
  selected?: boolean;
};

const { disabled = false, selected = false } = defineProps<MenuItemProps>();
</script>

<template>
  <button
    type="button"
    role="menuitem"
    :disabled="disabled"
    :data-selected="selected ? 'true' : undefined"
    :class="['state-layer', style.item]"
  >
    <slot />
  </button>
</template>
