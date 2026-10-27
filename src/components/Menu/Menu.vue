<script setup lang="ts">
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { computed, inject, provide, unref, useId, useTemplateRef } from 'vue';
import { menuDefaultsContextKey } from './MenuDefaultsContext';
import { useMenu } from '@/composables/useMenu';
import MenuContentRenderer from './MenuContentRenderer.vue';
import { menuContextKey, menuItemOwnerContextKey, menuSelectionContextKey, menuSubmenuContextKey } from './MenuContext';
import type { MenuColor, MenuContentItem, MenuItemValue, MenuModelValue } from './MenuTypes';

export type { MenuColor, MenuContentItem, MenuItemValue, MenuModelValue };

export type MenuProps = {
  /** Row size; inherits the nearest row size or defaults to medium. */
  size?: RowSize;
  /** Visual color style of the menu surface. */
  color?: MenuColor;

  /** Optional declarative menu content rendered from plain objects. */
  items?: MenuContentItem[];

  /** Enables checkbox semantics and array-based model values for items with `value`. */
  multiple?: boolean;
};

const { size = undefined, color: colorProp, items = undefined, multiple = false } = defineProps<MenuProps>();

const defaults = inject(menuDefaultsContextKey, undefined);
const color = computed(() => colorProp ?? unref(defaults?.color) ?? 'standard');

const open = defineModel<boolean>('open', { default: false });
const modelValue = defineModel<MenuModelValue>();

const emit = defineEmits<{
  /** Fired when a menu item is activated. */
  select: [event: MouseEvent, itemElement: HTMLElement];

  /** Fired after the Menu-owned visual exit finishes. */
  closed: [];
}>();

defineSlots<{
  /** Menu content; usually MenuContainer and MenuGap. */
  default(): any;
}>();

const menuRef = useTemplateRef<HTMLDivElement>('menu');
const surfaceRef = useTemplateRef<HTMLDivElement>('surface');
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
  exitElements: () => [surfaceRef.value],
  onClosed: () => emit('closed'),
  parentCloseAll: parentMenu?.closeAll,
  parentSubmenu,
});

provide(menuItemOwnerContextKey, {
  id: menuId,
});

provide(menuContextKey, {
  getColor: () => color.value,
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
const rowSize = provideRowSize(() => size);
</script>

<template>
  <div
    ref="menu"
    popover="auto"
    role="menu"
    aria-orientation="vertical"
    class="m3-menu m3-dropdown"
    :data-size="rowSize"
    data-scope="menu"
    data-part="root"
    :data-color="color"
    :data-menu-id="menuId"
    @toggle="menuActions.onMenuToggle"
    @keydown="menuActions.onMenuKeydown"
    @click="menuActions.onMenuClick"
    @focusin="menuActions.onMenuFocusIn"
  >
    <div ref="surface" class="m3-menu-surface" data-scope="menu" data-part="surface">
      <MenuContentRenderer v-if="items?.length" :items="items" />
      <slot />
    </div>
  </div>
</template>

<style src="./Menu.css"></style>
