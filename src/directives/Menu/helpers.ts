import type { DirectiveBinding } from 'vue';

export type MenuTargetBinding =
  | string
  | HTMLElement
  | {
      target: string | HTMLElement;
      closeOnOutsideClick?: boolean;
    };

export function resolveMenuTarget(binding: DirectiveBinding<MenuTargetBinding>): HTMLElement | null {
  const value = binding.value;

  if (!value) {
    return null;
  }

  const target = typeof value === 'object' && 'target' in value ? value.target : value;

  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target);
  }

  return target;
}

export function shouldCloseOnOutsideClick(binding: DirectiveBinding<MenuTargetBinding>) {
  return typeof binding.value === 'object' && binding.value !== null && 'closeOnOutsideClick' in binding.value
    ? binding.value.closeOnOutsideClick !== false
    : true;
}

export type MenuShowOptions = {
  focus?: 'first' | 'last';
  source?: HTMLElement;
};

function isMenuOpen(menu: HTMLElement) {
  try {
    return menu.matches(':popover-open') || menu.dataset.popoverOpen === 'true';
  } catch {
    return menu.dataset.popoverOpen === 'true';
  }
}

export function showMenuElement(menu: HTMLElement, options: MenuShowOptions = {}) {
  if (isMenuOpen(menu)) {
    menu.dataset.popoverOpen = 'true';
    return;
  }

  menu.dispatchEvent(new CustomEvent('m3-menu:show', { detail: options }));
  menu.dataset.popoverOpen = 'true';

  try {
    if (options.source) {
      menu.showPopover({ source: options.source });
      return;
    }

    menu.showPopover();
  } catch {
  }
}

export function hideMenuElement(menu: HTMLElement) {
  if (!isMenuOpen(menu)) {
    delete menu.dataset.popoverOpen;
    return;
  }

  menu.dispatchEvent(new CustomEvent('m3-menu:hide'));
  delete menu.dataset.popoverOpen;

  try {
    menu.hidePopover();
  } catch {
  }
}

export function toggleMenuElement(menu: HTMLElement, options: MenuShowOptions = {}) {
  if (isMenuOpen(menu)) {
    hideMenuElement(menu);
    return;
  }

  showMenuElement(menu, options);
}
