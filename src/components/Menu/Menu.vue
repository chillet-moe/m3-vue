<script setup lang="ts">
import { inject, provide, useId, useTemplateRef } from 'vue';
import { useMenu } from '@/composables/useMenu';
import MenuContentRenderer from './MenuContentRenderer.vue';
import { menuContextKey, menuItemOwnerContextKey, menuSelectionContextKey, menuSubmenuContextKey } from './MenuContext';
import type { MenuColor, MenuContentItem, MenuItemValue, MenuModelValue } from './MenuTypes';

export type { MenuColor, MenuContentItem, MenuItemValue, MenuModelValue };

export type MenuProps = {
  /** Visual color style of the menu surface. */
  color?: MenuColor;

  /** Optional declarative menu content rendered from plain objects. */
  items?: MenuContentItem[];

  /** Enables checkbox semantics and array-based model values for items with `value`. */
  multiple?: boolean;
};

const { color = 'standard', items = undefined, multiple = false } = defineProps<MenuProps>();

const open = defineModel<boolean>('open', { default: false });
const modelValue = defineModel<MenuModelValue>();

const emit = defineEmits<{
  /** Fired when a menu item is activated. */
  select: [event: MouseEvent, itemElement: HTMLElement];
}>();

defineSlots<{
  /** Menu content; usually MenuContainer and MenuGap. */
  default(): any;
}>();

const menuRef = useTemplateRef<HTMLDivElement>('menu');
const ambientParentMenu = inject(menuContextKey, null);
const parentSubmenu = inject(menuSubmenuContextKey, null);
// Only MenuSubMenu opts a child Menu into the parent menu chain.
const parentMenu = parentSubmenu ? ambientParentMenu : null;
const menuId = `menu-${useId()}`;

const notifySelect = (event: MouseEvent, itemElement: HTMLElement) => {
  if (parentMenu) {
    parentMenu.notifySelect(event, itemElement);
    return;
  }
  emit('select', event, itemElement);
};

const menuActions = useMenu({
  menuId,
  menuRef: menuRef as any,
  open,
  modelValue,
  multiple: () => multiple,
  onSelect: notifySelect,
  parentCloseAll: parentMenu?.closeAll,
  parentSubmenu,
});

provide(menuItemOwnerContextKey, {
  id: menuId,
});

provide(menuContextKey, {
  getColor: () => color,
  notifySelect,
  closeAll: menuActions.closeMenuChain,
  registerSubmenu: menuActions.registerSubmenu,
  closeSubmenus: menuActions.closeSubmenus,
});

provide(menuSelectionContextKey, {
  multiple: () => multiple,
  isSelected: menuActions.isValueSelected,
  toggle: menuActions.toggleValue,
});

defineExpose({
  menuRef,
  show: menuActions.show,
  hide: menuActions.hide,
  toggle: menuActions.toggle,
});
</script>

<template>
  <div
    ref="menu"
    popover="auto"
    role="menu"
    aria-orientation="vertical"
    class="m3-menu m3-dropdown"
    data-scope="menu"
    data-part="root"
    :data-color="color"
    :data-menu-id="menuId"
    @toggle="menuActions.onMenuToggle"
    @keydown="menuActions.onMenuKeydown"
    @click="menuActions.onMenuClick"
    @focusin="menuActions.onMenuFocusIn"
  >
    <div class="m3-menu-surface" data-scope="menu" data-part="surface">
      <MenuContentRenderer v-if="items?.length" :items="items" />
      <slot />
    </div>
  </div>
</template>

<style src="./Menu.css"></style>
