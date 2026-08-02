import type { Directive } from 'vue';
import { hideMenuElement, needsCustomOutsideClick, resolveMenuTarget, showMenuElement } from './helpers';
import type { MenuTargetBinding } from './helpers';
import { registerOutsidePointerDown } from '@/internal/outsidePointerDown';

type CleanupRecord = {
  onContextMenu: (event: MouseEvent) => void;
  cleanupOutsidePointerDown?: () => void;
  menu: HTMLElement;
  onToggle?: () => void;
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

    let cleanupOutsidePointerDown: (() => void) | undefined;
    let onToggle: (() => void) | undefined;

    if (needsCustomOutsideClick(binding, menu)) {
      const syncOutsidePointerDown = () => {
        if (menu.matches(':popover-open')) {
          cleanupOutsidePointerDown ??= registerOutsidePointerDown(host.ownerDocument, {
            contains: (target) => host.contains(target) || menu.contains(target),
            onOutside: () => hideMenuElement(menu),
          });
          return;
        }

        cleanupOutsidePointerDown?.();
        cleanupOutsidePointerDown = undefined;
      };

      onToggle = syncOutsidePointerDown;
      menu.addEventListener('toggle', onToggle);
      syncOutsidePointerDown();
    }

    cleanupMap.set(host, {
      menu,
      onContextMenu,
      cleanupOutsidePointerDown: onToggle
        ? () => {
            cleanupOutsidePointerDown?.();
            cleanupOutsidePointerDown = undefined;
          }
        : undefined,
      onToggle,
    });
  },
  unmounted(host) {
    const record = cleanupMap.get(host);

    if (!record) {
      return;
    }

    host.removeEventListener('contextmenu', record.onContextMenu);

    record.cleanupOutsidePointerDown?.();
    if (record.onToggle) record.menu.removeEventListener('toggle', record.onToggle);

    cleanupMap.delete(host);
  },
};

export default vContextMenu;
