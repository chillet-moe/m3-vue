import type { DirectiveBinding } from 'vue';

export type DropdownTargetBinding =
  | string
  | HTMLElement
  | {
      /** Element used as the position anchor. Defaults to the trigger element. */
      anchor?: HTMLElement | null;
      /**
       * Closes when a pointer event happens outside trigger and dropdown.
       * @default true
       */
      closeOnOutsideClick?: boolean;
      /** Popover surface to control. */
      target: string | HTMLElement | null;
    }
  | null
  | undefined;

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

export function needsCustomOutsideClick(binding: DirectiveBinding<DropdownTargetBinding>, dropdown: HTMLElement) {
  if (!shouldCloseOnOutsideClick(binding)) return false;

  const popoverType = dropdown.getAttribute('popover');
  return popoverType !== 'auto' && popoverType !== 'hint';
}

export function resolveDropdownAnchor(binding: DirectiveBinding<DropdownTargetBinding>, trigger: HTMLElement) {
  const value = binding.value;

  if (!value || typeof value !== 'object' || !('anchor' in value)) {
    return trigger;
  }

  return value.anchor ?? trigger;
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
