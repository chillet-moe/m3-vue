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
  return menu.matches(':popover-open');
}

export function showMenuElement(menu: HTMLElement, options: MenuShowOptions = {}) {
  if (isMenuOpen(menu)) {
    return;
  }

  menu.dispatchEvent(new CustomEvent('m3-menu:show', { detail: options }));

  if (options.source) {
    try {
      menu.showPopover({ source: options.source });
    } catch {
      menu.showPopover();
    }
    return;
  }

  menu.showPopover();
}

export function hideMenuElement(menu: HTMLElement) {
  if (!isMenuOpen(menu)) {
    return;
  }

  menu.dispatchEvent(new CustomEvent('m3-menu:hide'));
  menu.hidePopover();
}

export function toggleMenuElement(menu: HTMLElement, options: MenuShowOptions = {}) {
  if (isMenuOpen(menu)) {
    hideMenuElement(menu);
    return;
  }

  showMenuElement(menu, options);
}
