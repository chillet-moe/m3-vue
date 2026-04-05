<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue';
import style from './Menu.module.css';

export type MenuColor = 'standard' | 'vibrant';

export type MenuProps = {
  /** Visual color style of the menu surface. */
  color?: MenuColor;
};

const { color = 'standard' } = defineProps<MenuProps>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** Fired when a menu item is activated. */
  select: [event: MouseEvent, itemElement: HTMLElement];
}>();

defineSlots<{
  /** Menu content; usually MenuItem, Divider, gap blocks, etc. */
  default(): any;
}>();

const menuRef = useTemplateRef<HTMLDivElement>('menu');

function showMenu() {
  const menu = menuRef.value;

  if (!menu) {
    return;
  }

  menu.hidden = false;
  menu.dataset.popoverOpen = 'true';

  try {
    menu.showPopover();
  } catch {
  }
}

function hideMenu() {
  const menu = menuRef.value;

  if (!menu) {
    return;
  }

  delete menu.dataset.popoverOpen;
  menu.hidden = true;

  try {
    menu.hidePopover();
  } catch {
  }
}

function getMenuItemElements() {
  const menu = menuRef.value;

  if (!menu) {
    return [] as HTMLElement[];
  }

  return Array.from(menu.querySelectorAll<HTMLElement>(
    '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])',
  ));
}

function focusItem(index: number) {
  const menuItems = getMenuItemElements();

  if (!menuItems.length) {
    return;
  }

  const normalized = (index + menuItems.length) % menuItems.length;
  menuItems[normalized]?.focus();
}

async function show(focusFirst = false) {
  open.value = true;
  showMenu();

  if (focusFirst) {
    await nextTick();
    focusItem(0);
  }
}

function hide() {
  open.value = false;
  hideMenu();
}

function toggle() {
  if (open.value) {
    hide();
    return;
  }

  void show();
}

function onMenuKeydown(event: KeyboardEvent) {
  const menuItems = getMenuItemElements();

  if (!menuItems.length) {
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
    }
    return;
  }

  const currentIndex = menuItems.findIndex((item) => item === document.activeElement);

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusItem(currentIndex + 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusItem(currentIndex - 1);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    focusItem(0);
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    focusItem(menuItems.length - 1);
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    hide();
  }
}

function onMenuClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;

  if (!target) {
    return;
  }

  const item = target.closest<HTMLElement>('[role="menuitem"]');

  if (!item || item.matches('[disabled], [aria-disabled="true"]')) {
    return;
  }

  emit('select', event, item);
}

watch(
  [menuRef, open],
  ([menu, nextOpen]) => {
    if (!menu) {
      return;
    }

    if (nextOpen) {
      showMenu();
      return;
    }

    hideMenu();
  },
  {
    immediate: true,
    flush: 'post',
  },
);

defineExpose({
  menuRef,
  show,
  hide,
  toggle,
});
</script>

<template>
  <div
    ref="menu"
    popover="manual"
    role="menu"
    :class="style.menu"
    :data-color="color"
    :hidden="open ? undefined : true"
    @keydown="onMenuKeydown"
    @click="onMenuClick"
  >
    <slot />
  </div>
</template>
