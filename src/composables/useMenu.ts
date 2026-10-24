import { type Ref, nextTick, onUnmounted, watch } from 'vue';
import type { MenuItemValue, MenuModelValue } from '@/components/Menu/MenuTypes';
import { useExitMotionCompletion } from './useExitMotionCompletion';

export type UseMenuOptions = {
  /** Unique ID for the menu instance. */
  menuId: string;

  /** Ref to the menu DOM element. */
  menuRef: Ref<HTMLElement | undefined>;

  /** Reactive open state. */
  open: Ref<boolean>;

  /** Reactive model value for selection. */
  modelValue: Ref<MenuModelValue>;

  /** Whether multi-select is enabled. */
  multiple: () => boolean;

  /** Notify parent of item selection. */
  onSelect?: (event: MouseEvent, itemElement: HTMLElement) => void;

  /** Component-owned elements whose exit motion must finish with the menu root. */
  exitElements?: () => readonly (HTMLElement | null | undefined)[];

  /** Runs after the menu's visual exit finishes. */
  onClosed?: () => void;

  /** Parent menu context (for nested menus). */
  parentCloseAll?: () => void;

  /** Parent submenu context. */
  parentSubmenu?: {
    close: () => void;
    closeAndFocusTrigger: () => void;
  } | null;
};

export type UseMenuReturn = {
  /** Show the menu. */
  show: (focusFirst?: boolean, source?: HTMLElement) => Promise<void>;

  /** Hide the menu. */
  hide: () => void;

  /** Toggle menu open state. */
  toggle: () => void;

  /** Register a submenu closer. Returns unregister function. */
  registerSubmenu: (close: () => void) => () => void;

  /** Close all submenus except the given one. */
  closeSubmenus: (except?: () => void) => void;

  /** Close the entire menu chain (including parent menus). */
  closeMenuChain: () => void;

  /** Check if a menu item value is currently selected. */
  isValueSelected: (value: MenuItemValue) => boolean;

  /** Toggle a menu item value in the selection. */
  toggleValue: (value: MenuItemValue) => void;

  /** Keyboard handler for the menu element. */
  onMenuKeydown: (event: KeyboardEvent) => void;

  /** Click handler for the menu element. */
  onMenuClick: (event: MouseEvent) => void;

  /** Focus-in handler for the menu element. */
  onMenuFocusIn: (event: FocusEvent) => void;

  /** Popover toggle handler for the menu element. */
  onMenuToggle: (event: Event) => void;

  /** Focus a specific menu item by index (wrapping). */
  focusItem: (index: number) => void;

  /** Get all enabled menu item elements owned by this menu. */
  getMenuItemElements: () => HTMLElement[];
};

export function useMenu(options: UseMenuOptions): UseMenuReturn {
  const { menuId, menuRef, open, modelValue, multiple, onSelect, parentCloseAll, parentSubmenu } = options;

  const submenuClosers = new Set<() => void>();
  const exitCompletion = useExitMotionCompletion<void>({
    rootRef: menuRef,
    open,
    ownedElements: options.exitElements,
    onComplete: options.onClosed,
  });

  function registerSubmenu(close: () => void) {
    submenuClosers.add(close);
    return () => {
      submenuClosers.delete(close);
    };
  }

  function closeSubmenus(except?: () => void) {
    for (const close of submenuClosers) {
      if (close === except) continue;
      close();
    }
  }

  function closeMenuChain() {
    parentSubmenu?.close();
    if (parentCloseAll) {
      parentCloseAll();
      return;
    }
    hide();
  }

  function isValueSelected(value: MenuItemValue) {
    if (multiple()) {
      return Array.isArray(modelValue.value) ? modelValue.value.includes(value) : false;
    }
    return modelValue.value === value;
  }

  function toggleValue(value: MenuItemValue) {
    if (multiple()) {
      const currentValues = Array.isArray(modelValue.value) ? [...modelValue.value] : [];
      const currentIndex = currentValues.findIndex((item) => item === value);

      if (currentIndex >= 0) {
        currentValues.splice(currentIndex, 1);
      } else {
        currentValues.push(value);
      }

      modelValue.value = currentValues;
      return;
    }

    modelValue.value = value;
  }

  function isMenuOpen(menu: HTMLElement) {
    return menu.matches(':popover-open');
  }

  function showMenu(source?: HTMLElement) {
    const menu = menuRef.value;
    if (!menu) return;
    if (isMenuOpen(menu)) return;

    if (source) {
      try {
        menu.showPopover({ source } as any);
      } catch {
        menu.showPopover();
      }
      return;
    }

    menu.showPopover();
  }

  function hideMenu() {
    const menu = menuRef.value;
    if (!menu || !isMenuOpen(menu)) return;
    menu.hidePopover();
    exitCompletion.begin(undefined, menu);
  }

  function getMenuItemElements() {
    const menu = menuRef.value;
    if (!menu) return [] as HTMLElement[];

    return Array.from(
      menu.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled]):not([aria-disabled="true"]), [role="menuitemradio"]:not([disabled]):not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([disabled]):not([aria-disabled="true"])',
      ),
    ).filter((item) => item.dataset.menuOwner === menuId);
  }

  function focusItem(index: number) {
    const menuItems = getMenuItemElements();
    if (!menuItems.length) return;
    const normalized = (index + menuItems.length) % menuItems.length;
    menuItems[normalized]?.focus();
  }

  async function show(focusFirst = false, source?: HTMLElement) {
    exitCompletion.cancel();
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

    const currentIndex = menuItems.findIndex((item) => item === menuRef.value?.ownerDocument.activeElement);

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
    if (!target) return;

    const item = target.closest<HTMLElement>('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]');
    if (!item || item.dataset.menuOwner !== menuId || item.matches('[disabled], [aria-disabled="true"]')) return;
    if (item.dataset.submenu === 'true') return;

    const shouldCloseOnSelect = item.dataset.closeOnSelect !== 'false';

    closeSubmenus();
    onSelect?.(event, item);

    if (shouldCloseOnSelect) {
      closeMenuChain();
    }
  }

  function onMenuFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const item = target.closest<HTMLElement>('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]');
    if (!item || item.dataset.menuOwner !== menuId || item.dataset.submenu === 'true') return;

    closeSubmenus();
  }

  function onMenuToggle(event: Event) {
    const menu = event.currentTarget as HTMLElement | null;
    if (!menu) return;

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
      exitCompletion.cancel();
      if (!open.value) {
        open.value = true;
      }
      return;
    }

    closeSubmenus();
    if (open.value) {
      open.value = false;
    }
    exitCompletion.begin(undefined, menu);
  }

  type ExternalMenuShowDetail = {
    focus?: 'first' | 'last';
    source?: HTMLElement;
  };

  function onExternalDropdownShowWithFocus(event: Event) {
    const detail = 'detail' in event ? (event.detail as ExternalMenuShowDetail | undefined) : undefined;
    const focusTarget = detail?.focus;
    const source = detail?.source;

    open.value = true;
    showMenu(source);

    if (!focusTarget) return;

    void nextTick(() => {
      if (focusTarget === 'last') {
        const menuItems = getMenuItemElements();
        if (!menuItems.length) return;
        focusItem(menuItems.length - 1);
        return;
      }
      focusItem(0);
    });
  }

  function onExternalDropdownHide() {
    hide();
  }

  // Watch open state to sync popover visibility
  watch(
    [menuRef, open],
    ([menu, nextOpen]) => {
      if (!menu) return;
      if (nextOpen) {
        exitCompletion.cancel();
        showMenu();
        return;
      }
      hideMenu();
    },
    { immediate: true, flush: 'post' },
  );

  // Attach external dropdown event listeners
  watch(
    menuRef,
    (menu, previousMenu) => {
      previousMenu?.removeEventListener('m3-dropdown:show', onExternalDropdownShowWithFocus);
      previousMenu?.removeEventListener('m3-dropdown:hide', onExternalDropdownHide);

      if (!menu) return;

      menu.addEventListener('m3-dropdown:show', onExternalDropdownShowWithFocus);
      menu.addEventListener('m3-dropdown:hide', onExternalDropdownHide);
    },
    { immediate: true, flush: 'post' },
  );

  onUnmounted(() => {
    closeSubmenus();
    menuRef.value?.removeEventListener('m3-dropdown:show', onExternalDropdownShowWithFocus);
    menuRef.value?.removeEventListener('m3-dropdown:hide', onExternalDropdownHide);
  });

  return {
    show,
    hide,
    toggle,
    registerSubmenu,
    closeSubmenus,
    closeMenuChain,
    isValueSelected,
    toggleValue,
    onMenuKeydown,
    onMenuClick,
    onMenuFocusIn,
    onMenuToggle,
    focusItem,
    getMenuItemElements,
  };
}
