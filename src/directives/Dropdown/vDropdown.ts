import type { Directive } from 'vue';
import './vDropdown.css';
import {
  hideDropdownElement,
  resolveDropdownTarget,
  shouldCloseOnOutsideClick,
  showDropdownElement,
  toggleDropdownElement,
} from './helpers';
import type { DropdownTargetBinding } from './helpers';

type CleanupRecord = {
  dropdown: HTMLElement;
  onClick: (event: MouseEvent) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onDropdownClick: () => void;
  onDropdownKeydown: (event: KeyboardEvent) => void;
  onDocPointerDown?: (event: PointerEvent) => void;
};

const cleanupMap = new WeakMap<HTMLElement, CleanupRecord>();

const vDropdown: Directive<HTMLElement, DropdownTargetBinding> = {
  mounted(trigger, binding) {
    const dropdown = resolveDropdownTarget(binding);

    if (!dropdown) {
      return;
    }

    dropdown.classList.add('m3-dropdown');

    let ignoreSyntheticClickUntil = 0;

    const restoreTriggerFocusIfDropdownClosed = () => {
      void Promise.resolve().then(() => {
        if (dropdown.matches(':popover-open')) {
          return;
        }

        trigger.focus();
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.detail === 0 && performance.now() < ignoreSyntheticClickUntil) {
        ignoreSyntheticClickUntil = 0;
        return;
      }

      event.preventDefault();
      toggleDropdownElement(dropdown, { source: trigger });
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        return;
      }

      event.preventDefault();
      ignoreSyntheticClickUntil = performance.now() + 1_000;

      showDropdownElement(dropdown, {
        focus: event.key === 'ArrowUp' ? 'last' : 'first',
        source: trigger,
      });
    };

    const onDropdownClick = () => {
      restoreTriggerFocusIfDropdownClosed();
    };

    const onDropdownKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      restoreTriggerFocusIfDropdownClosed();
    };

    trigger.addEventListener('click', onClick);
    trigger.addEventListener('keydown', onKeydown);
    dropdown.addEventListener('click', onDropdownClick);
    dropdown.addEventListener('keydown', onDropdownKeydown);

    let onDocPointerDown: ((event: PointerEvent) => void) | undefined;

    if (shouldCloseOnOutsideClick(binding)) {
      onDocPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;

        if (!target) {
          return;
        }

        if (trigger.contains(target) || dropdown.contains(target)) {
          return;
        }

        hideDropdownElement(dropdown);
      };

      document.addEventListener('pointerdown', onDocPointerDown, true);
    }

    cleanupMap.set(trigger, { dropdown, onClick, onKeydown, onDropdownClick, onDropdownKeydown, onDocPointerDown });
  },
  unmounted(trigger) {
    const record = cleanupMap.get(trigger);

    if (!record) {
      return;
    }

    trigger.removeEventListener('click', record.onClick);
    trigger.removeEventListener('keydown', record.onKeydown);
    record.dropdown.removeEventListener('click', record.onDropdownClick);
    record.dropdown.removeEventListener('keydown', record.onDropdownKeydown);

    if (record.onDocPointerDown) {
      document.removeEventListener('pointerdown', record.onDocPointerDown, true);
    }

    cleanupMap.delete(trigger);
  },
};

export default vDropdown;
