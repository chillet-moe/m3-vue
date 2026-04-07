import type { Directive } from 'vue';
import { hideMenuElement, resolveMenuTarget, shouldCloseOnOutsideClick, showMenuElement } from './helpers';
import type { MenuTargetBinding } from './helpers';

type CleanupRecord = {
  onContextMenu: (event: MouseEvent) => void;
  onDocPointerDown?: (event: PointerEvent) => void;
};

const cleanupMap = new WeakMap<HTMLElement, CleanupRecord>();

const vContextMenu: Directive<HTMLElement, MenuTargetBinding> = {
  mounted(host, binding) {
    const menu = resolveMenuTarget(binding);

    if (!menu) {
      return;
    }

    menu.classList.add('m3-dropdown');

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();

      menu.style.removeProperty('position-anchor');
      menu.style.removeProperty('position-area');
      menu.style.setProperty('left', `${event.clientX}px`);
      menu.style.setProperty('top', `${event.clientY}px`);

      showMenuElement(menu);
    };

    host.addEventListener('contextmenu', onContextMenu);

    let onDocPointerDown: ((event: PointerEvent) => void) | undefined;

    if (shouldCloseOnOutsideClick(binding)) {
      onDocPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;

        if (!target) {
          return;
        }

        if (host.contains(target) || menu.contains(target)) {
          return;
        }

        hideMenuElement(menu);
      };

      document.addEventListener('pointerdown', onDocPointerDown, true);
    }

    cleanupMap.set(host, { onContextMenu, onDocPointerDown });
  },
  unmounted(host) {
    const record = cleanupMap.get(host);

    if (!record) {
      return;
    }

    host.removeEventListener('contextmenu', record.onContextMenu);

    if (record.onDocPointerDown) {
      document.removeEventListener('pointerdown', record.onDocPointerDown, true);
    }

    cleanupMap.delete(host);
  },
};

export default vContextMenu;
