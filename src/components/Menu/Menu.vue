<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, useId, useTemplateRef, watch } from 'vue';
import style from './Menu.module.css';

export type MenuColor = 'standard' | 'vibrant';

export type MenuProps = {
  /** Visual color style of the menu surface. */
  color?: MenuColor;

  /** Accessible label for the trigger button. */
  triggerLabel?: string;

  /** Whether selecting an item closes the menu. */
  closeOnSelect?: boolean;
};

const { color = 'standard', triggerLabel = 'Open menu', closeOnSelect = true } = defineProps<MenuProps>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  /** Fired when a menu item is activated. */
  select: [event: MouseEvent, itemElement: HTMLElement];
}>();

defineSlots<{
  /** Optional trigger content. */
  trigger(): any;

  /** Menu content; usually MenuItem, Divider, gap blocks, etc. */
  default(): any;
}>();

const triggerRef = useTemplateRef<HTMLButtonElement>('trigger');
const menuRef = useTemplateRef<HTMLDivElement>('menu');

const menuId = `menu-${useId()}`;
const anchorName = `--menu-anchor-${menuId}`;

function showMenu() {
  const menu = menuRef.value;

  if (!menu) {
    return;
  }

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

async function openMenuAndFocus(index = 0) {
  open.value = true;
  showMenu();
  await nextTick();
  focusItem(index);
}

function closeMenuAndFocusTrigger() {
  open.value = false;
  hideMenu();
  triggerRef.value?.focus();
}

function onTriggerClick() {
  if (open.value) {
    open.value = false;
    hideMenu();
    return;
  }

  void openMenuAndFocus(0);
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    void openMenuAndFocus(0);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    void openMenuAndFocus(-1);
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  const menuItems = getMenuItemElements();

  if (!menuItems.length) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenuAndFocusTrigger();
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
    closeMenuAndFocusTrigger();
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

  if (closeOnSelect) {
    closeMenuAndFocusTrigger();
  }
}

function onDocumentPointerDown(event: Event) {
  const target = event.target as Node | null;

  if (!target) {
    return;
  }

  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) {
    return;
  }

  open.value = false;
  hideMenu();
}

watch(
  [menuRef, open],
  async ([menu, nextOpen]) => {
    if (!menu) {
      return;
    }

    if (nextOpen) {
      showMenu();
      await nextTick();
      if (document.activeElement === triggerRef.value) {
        focusItem(0);
      }
      return;
    }

    hideMenu();
  },
  {
    immediate: true,
    flush: 'post',
  },
);

watch(
  triggerRef,
  (trigger) => {
    if (!trigger) {
      return;
    }

    trigger.style.setProperty('anchor-name', anchorName);
  },
  {
    immediate: true,
    flush: 'post',
  },
);

watch(
  menuRef,
  (menu) => {
    if (!menu) {
      return;
    }

    menu.style.setProperty('position-anchor', anchorName);
  },
  {
    immediate: true,
    flush: 'post',
  },
);

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true);
});
</script>

<template>
  <div :class="style.root">
    <button
      ref="trigger"
      type="button"
      :class="style.trigger"
      :aria-label="triggerLabel"
      aria-haspopup="menu"
      :aria-controls="menuId"
      :aria-expanded="open ? 'true' : 'false'"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger">{{ triggerLabel }}</slot>
    </button>

    <div
      :id="menuId"
      ref="menu"
      popover="manual"
      role="menu"
      :class="style.menu"
      :data-color="color"
      @keydown="onMenuKeydown"
      @click="onMenuClick"
    >
      <slot />
    </div>
  </div>
</template>
