import type { DirectiveBinding } from 'vue';

export type DropdownTargetBinding =
  | string
  | HTMLElement
  | {
      target: string | HTMLElement;
      closeOnOutsideClick?: boolean;
    };

export function resolveDropdownTarget(binding: DirectiveBinding<DropdownTargetBinding>): HTMLElement | null {
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

export function shouldCloseOnOutsideClick(binding: DirectiveBinding<DropdownTargetBinding>) {
  return typeof binding.value === 'object' && binding.value !== null && 'closeOnOutsideClick' in binding.value
    ? binding.value.closeOnOutsideClick !== false
    : true;
}

export type DropdownShowOptions = {
  focus?: 'first' | 'last';
  source?: HTMLElement;
};

function isDropdownOpen(dropdown: HTMLElement) {
  return dropdown.matches(':popover-open');
}

export function showDropdownElement(dropdown: HTMLElement, options: DropdownShowOptions = {}) {
  if (isDropdownOpen(dropdown)) {
    return;
  }

  dropdown.dispatchEvent(new CustomEvent('m3-dropdown:show', { detail: options }));

  if (options.source) {
    try {
      dropdown.showPopover({ source: options.source });
    } catch {
      dropdown.showPopover();
    }
    return;
  }

  dropdown.showPopover();
}

export function hideDropdownElement(dropdown: HTMLElement) {
  if (!isDropdownOpen(dropdown)) {
    return;
  }

  dropdown.dispatchEvent(new CustomEvent('m3-dropdown:hide'));
  dropdown.hidePopover();
}

export function toggleDropdownElement(dropdown: HTMLElement, options: DropdownShowOptions = {}) {
  if (isDropdownOpen(dropdown)) {
    hideDropdownElement(dropdown);
    return;
  }

  showDropdownElement(dropdown, options);
}
