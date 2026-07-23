import { watch, type Ref } from 'vue';
import { hideDropdownElement, showDropdownElement } from '@/directives/Dropdown/helpers';
import type { SelectMenuRef, SelectTextFieldRef } from './selectTypes';

export type UseSelectMenuOptions = {
  filterable: () => boolean;
  disabled: () => boolean;
  open: Ref<boolean>;
  menuRef: SelectMenuRef;
  triggerRef: Ref<HTMLElement | undefined>;
  textFieldRef: SelectTextFieldRef;
  onClosed: () => void;
};

export type UseSelectMenuReturn = {
  focus: () => void;
  blur: () => void;
  show: () => Promise<void>;
  hide: () => void;
  toggle: () => void;
  openMenu: (focus?: 'first' | 'last') => void;
  closeMenu: () => void;
  handleFieldClick: () => void;
  handleFieldInput: () => void;
  handleFilterKeydown: (event: KeyboardEvent) => void;
};

export function useSelectMenu({
  filterable,
  disabled,
  open,
  menuRef,
  triggerRef,
  textFieldRef,
  onClosed,
}: UseSelectMenuOptions): UseSelectMenuReturn {
  function focus() {
    textFieldRef.value?.focus();
  }

  function blur() {
    textFieldRef.value?.blur();
  }

  async function show() {
    if (filterable()) {
      textFieldRef.value?.focus();
    }
    await menuRef.value?.show(false, triggerRef.value);
  }

  function hide() {
    menuRef.value?.hide();
  }

  function toggle() {
    menuRef.value?.toggle();
  }

  function openMenu(focusTarget: 'first' | 'last' | undefined = undefined) {
    const menuElement = menuRef.value?.menuRef;
    if (!menuElement) {
      return;
    }

    open.value = true;
    showDropdownElement(menuElement, {
      focus: focusTarget,
      source: triggerRef.value,
    });
  }

  function closeMenu() {
    const menuElement = menuRef.value?.menuRef;
    if (!menuElement) {
      return;
    }

    open.value = false;
    hideDropdownElement(menuElement);
  }

  function handleFieldClick() {
    if (disabled() || open.value) {
      return;
    }

    if (filterable()) {
      textFieldRef.value?.focus();
    }

    openMenu();
  }

  function handleFieldInput() {
    if (!filterable() || disabled()) {
      return;
    }

    if (!open.value) {
      openMenu();
    }
  }

  function handleFilterKeydown(event: KeyboardEvent) {
    if (disabled()) {
      return;
    }

    if (event.key === 'Escape' && open.value) {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('first');
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
      return;
    }

    if (!filterable() && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openMenu('first');
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.stopPropagation();
    }
  }

  watch(
    open,
    (nextOpen) => {
      if (nextOpen) {
        if (filterable()) {
          textFieldRef.value?.focus();
        }
        return;
      }

      onClosed();
    },
    { immediate: true },
  );

  return {
    focus,
    blur,
    show,
    hide,
    toggle,
    openMenu,
    closeMenu,
    handleFieldClick,
    handleFieldInput,
    handleFilterKeydown,
  };
}
