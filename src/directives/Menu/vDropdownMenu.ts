import type { Directive } from 'vue';
import {
  hideMenuElement,
  resolveMenuTarget,
  shouldCloseOnOutsideClick,
  showMenuElement,
  toggleMenuElement,
} from './helpers';
import type { MenuTargetBinding } from './helpers';

type CleanupRecord = {
  menu: HTMLElement;
  onClick: (event: MouseEvent) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onMenuClick: () => void;
  onMenuKeydown: (event: KeyboardEvent) => void;
  onDocPointerDown?: (event: PointerEvent) => void;
};

const cleanupMap = new WeakMap<HTMLElement, CleanupRecord>();

const vDropdownMenu: Directive<HTMLElement, MenuTargetBinding> = {
  mounted(trigger, binding) {
    const menu = resolveMenuTarget(binding);

    if (!menu) {
      return;
    }

    let ignoreSyntheticClickUntil = 0;

    const restoreTriggerFocusIfMenuClosed = () => {
      void Promise.resolve().then(() => {
        if (menu.dataset.popoverOpen === 'true') {
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
      toggleMenuElement(menu, { source: trigger });
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        return;
      }

      event.preventDefault();
      ignoreSyntheticClickUntil = performance.now() + 1_000;

      showMenuElement(menu, {
        focus: event.key === 'ArrowUp' ? 'last' : 'first',
        source: trigger,
      });
    };

    const onMenuClick = () => {
      restoreTriggerFocusIfMenuClosed();
    };

    const onMenuKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      restoreTriggerFocusIfMenuClosed();
    };

    trigger.addEventListener('click', onClick);
    trigger.addEventListener('keydown', onKeydown);
    menu.addEventListener('click', onMenuClick);
    menu.addEventListener('keydown', onMenuKeydown);

    let onDocPointerDown: ((event: PointerEvent) => void) | undefined;

    if (shouldCloseOnOutsideClick(binding)) {
      onDocPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;

        if (!target) {
          return;
        }

        if (trigger.contains(target) || menu.contains(target)) {
          return;
        }

        hideMenuElement(menu);
      };

      document.addEventListener('pointerdown', onDocPointerDown, true);
    }

    cleanupMap.set(trigger, { menu, onClick, onKeydown, onMenuClick, onMenuKeydown, onDocPointerDown });
  },
  unmounted(trigger) {
    const record = cleanupMap.get(trigger);

    if (!record) {
      return;
    }

    trigger.removeEventListener('click', record.onClick);
    trigger.removeEventListener('keydown', record.onKeydown);
    record.menu.removeEventListener('click', record.onMenuClick);
    record.menu.removeEventListener('keydown', record.onMenuKeydown);

    if (record.onDocPointerDown) {
      document.removeEventListener('pointerdown', record.onDocPointerDown, true);
    }

    cleanupMap.delete(trigger);
  },
};

export default vDropdownMenu;
