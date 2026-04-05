import type { Directive } from 'vue';
import {
  hideMenuElement,
  resolveMenuTarget,
  shouldCloseOnOutsideClick,
  toggleMenuElement,
} from './helpers';
import type { MenuTargetBinding } from './helpers';

type CleanupRecord = {
  onClick: (event: MouseEvent) => void;
  onDocPointerDown?: (event: PointerEvent) => void;
};

const cleanupMap = new WeakMap<HTMLElement, CleanupRecord>();

const vDropdownMenu: Directive<HTMLElement, MenuTargetBinding> = {
  mounted(trigger, binding) {
    const menu = resolveMenuTarget(binding);

    if (!menu) {
      return;
    }

    const anchorName = `--dropdown-anchor-${Math.random().toString(36).slice(2)}`;
    trigger.style.setProperty('anchor-name', anchorName);
    menu.style.setProperty('position-anchor', anchorName);

    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      toggleMenuElement(menu);
    };

    trigger.addEventListener('click', onClick);

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

    cleanupMap.set(trigger, { onClick, onDocPointerDown });
  },
  unmounted(trigger) {
    const record = cleanupMap.get(trigger);

    if (!record) {
      return;
    }

    trigger.removeEventListener('click', record.onClick);

    if (record.onDocPointerDown) {
      document.removeEventListener('pointerdown', record.onDocPointerDown, true);
    }

    cleanupMap.delete(trigger);
  },
};

export default vDropdownMenu;
