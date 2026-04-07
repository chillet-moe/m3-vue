<script setup lang="ts">
import { inject, nextTick, onUnmounted, provide, useId, useTemplateRef, watch } from 'vue';
import { menuContextKey, menuSubmenuContextKey } from './MenuContext';

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
  /** Menu content; usually MenuContainer and MenuGap. */
  default(): any;
}>();

const menuRef = useTemplateRef<HTMLDivElement>('menu');
const parentMenu = inject(menuContextKey, null);
const parentSubmenu = inject(menuSubmenuContextKey, null);
const menuId = `menu-${useId()}`;
const submenuClosers = new Set<() => void>();

type ExternalMenuShowDetail = {
  focus?: 'first' | 'last';
  source?: HTMLElement;
};

function registerSubmenu(close: () => void) {
  submenuClosers.add(close);

  return () => {
    submenuClosers.delete(close);
  };
}

function closeSubmenus(except?: () => void) {
  for (const close of submenuClosers) {
    if (close === except) {
      continue;
    }

    close();
  }
}

function closeMenuChain() {
  parentSubmenu?.close();
  parentMenu?.closeAll() ?? hide();
}

function isMenuOpen(menu: HTMLElement) {
  return menu.matches(':popover-open');
}

provide(menuContextKey, {
  id: menuId,
  getColor: () => color,
  notifySelect: (event, itemElement) => {
    parentMenu?.notifySelect(event, itemElement) ?? emit('select', event, itemElement);
  },
  closeAll: closeMenuChain,
  registerSubmenu,
  closeSubmenus,
});

function showMenu(source?: HTMLElement) {
  const menu = menuRef.value;

  if (!menu) {
    return;
  }

  if (isMenuOpen(menu)) {
    return;
  }

  if (source) {
    try {
      menu.showPopover({ source });
    } catch {
      menu.showPopover();
    }
    return;
  }

  menu.showPopover();
}

function hideMenu() {
  const menu = menuRef.value;

  if (!menu) {
    return;
  }

  if (!isMenuOpen(menu)) {
    return;
  }

  menu.hidePopover();
}

function getMenuItemElements() {
  const menu = menuRef.value;

  if (!menu) {
    return [] as HTMLElement[];
  }

  return Array.from(
    menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'),
  ).filter((item) => item.dataset.menuOwner === menuId);
}

function focusItem(index: number) {
  const menuItems = getMenuItemElements();

  if (!menuItems.length) {
    return;
  }

  const normalized = (index + menuItems.length) % menuItems.length;
  menuItems[normalized]?.focus();
}

async function show(focusFirst = false, source?: HTMLElement) {
  open.value = true;
  showMenu(source);

  if (focusFirst) {
    await nextTick();
    focusItem(0);
  }
}

function hide() {
  closeSubmenus();
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
      event.stopPropagation();
      hide();
    }
    return;
  }

  const currentIndex = menuItems.findIndex((item) => item === document.activeElement);

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    event.stopPropagation();
    closeSubmenus();
    focusItem(currentIndex + 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    event.stopPropagation();
    closeSubmenus();
    focusItem(currentIndex - 1);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    event.stopPropagation();
    closeSubmenus();
    focusItem(0);
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    event.stopPropagation();
    closeSubmenus();
    focusItem(menuItems.length - 1);
    return;
  }

  if (event.key === 'ArrowLeft' && parentSubmenu) {
    event.preventDefault();
    event.stopPropagation();
    parentSubmenu.closeAndFocusTrigger();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();

    if (parentSubmenu) {
      parentSubmenu.closeAndFocusTrigger();
      return;
    }

    hide();
  }
}

function onMenuClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;

  if (!target) {
    return;
  }

  const item = target.closest<HTMLElement>('[role="menuitem"]');

  if (!item || item.dataset.menuOwner !== menuId || item.matches('[disabled], [aria-disabled="true"]')) {
    return;
  }

  if (item.dataset.submenu === 'true') {
    return;
  }

  const shouldCloseOnSelect = item.dataset.closeOnSelect !== 'false';

  closeSubmenus();
  parentMenu?.notifySelect(event, item) ?? emit('select', event, item);

  if (shouldCloseOnSelect) {
    closeMenuChain();
  }
}

function onMenuFocusIn(event: FocusEvent) {
  const target = event.target as HTMLElement | null;

  if (!target) {
    return;
  }

  const item = target.closest<HTMLElement>('[role="menuitem"]');

  if (!item || item.dataset.menuOwner !== menuId || item.dataset.submenu === 'true') {
    return;
  }

  closeSubmenus();
}

function onMenuToggle(event: Event) {
  const menu = event.currentTarget as HTMLElement | null;

  if (!menu) {
    return;
  }

  const nextState = (event as Event & { newState?: 'open' | 'closed' }).newState;
  let isOpen: boolean;

  if (nextState === 'open') {
    isOpen = true;
  } else if (nextState === 'closed') {
    isOpen = false;
  } else {
    isOpen = isMenuOpen(menu);
  }

  if (isOpen) {
    if (!open.value) {
      open.value = true;
    }

    return;
  }

  closeSubmenus();

  if (open.value) {
    open.value = false;
  }
}

function onExternalDropdownShowWithFocus(event: Event) {
  const detail = event instanceof CustomEvent ? (event.detail as ExternalMenuShowDetail | undefined) : undefined;
  const focusTarget = detail?.focus;
  const source = detail?.source;

  open.value = true;
  showMenu(source);

  if (!focusTarget) {
    return;
  }

  void nextTick(() => {
    if (focusTarget === 'last') {
      const menuItems = getMenuItemElements();

      if (!menuItems.length) {
        return;
      }

      focusItem(menuItems.length - 1);
      return;
    }

    focusItem(0);
  });
}

function onExternalDropdownHide() {
  hide();
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

watch(
  menuRef,
  (menu, previousMenu) => {
    previousMenu?.removeEventListener('m3-dropdown:show', onExternalDropdownShowWithFocus);
    previousMenu?.removeEventListener('m3-dropdown:hide', onExternalDropdownHide);

    if (!menu) {
      return;
    }

    menu.addEventListener('m3-dropdown:show', onExternalDropdownShowWithFocus);
    menu.addEventListener('m3-dropdown:hide', onExternalDropdownHide);
  },
  {
    immediate: true,
    flush: 'post',
  },
);

onUnmounted(() => {
  closeSubmenus();
  menuRef.value?.removeEventListener('m3-dropdown:show', onExternalDropdownShowWithFocus);
  menuRef.value?.removeEventListener('m3-dropdown:hide', onExternalDropdownHide);
});

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
    popover="auto"
    role="menu"
    aria-orientation="vertical"
    class="m3-menu m3-dropdown"
    :data-color="color"
    :data-menu-id="menuId"
    @toggle="onMenuToggle"
    @keydown="onMenuKeydown"
    @click="onMenuClick"
    @focusin="onMenuFocusIn"
  >
    <div class="m3-menu-surface">
      <slot />
    </div>
  </div>
</template>

<style src="./Menu.css"></style>
