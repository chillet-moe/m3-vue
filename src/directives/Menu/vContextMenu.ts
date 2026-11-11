import { bindElementEnvironment } from '@/internal/elementEnvironment';
import { registerOutsidePointerDown } from '@/internal/outsidePointerDown';
import type { Directive } from 'vue';
import { hideMenuElement, needsCustomOutsideClick, resolveMenuTarget, showMenuElement } from './helpers';
import type { MenuTargetBinding } from './helpers';

const environments = new WeakMap<HTMLElement, () => void>();

const vContextMenu: Directive<HTMLElement, MenuTargetBinding> = {
  mounted(host, binding) {
    environments.set(
      host,
      bindElementEnvironment(host, (document) => {
        const menu = resolveMenuTarget(binding, document);
        if (!menu) return;

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

        if (!needsCustomOutsideClick(binding, menu)) {
          return () => host.removeEventListener('contextmenu', onContextMenu);
        }

        let cleanupOutsidePointerDown: (() => void) | undefined;

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

        menu.addEventListener('toggle', syncOutsidePointerDown);
        syncOutsidePointerDown();

        return () => {
          host.removeEventListener('contextmenu', onContextMenu);
          cleanupOutsidePointerDown?.();
          menu.removeEventListener('toggle', syncOutsidePointerDown);
        };
      }),
    );
  },
  unmounted(host) {
    environments.get(host)?.();
    environments.delete(host);
  },
};

export default vContextMenu;
