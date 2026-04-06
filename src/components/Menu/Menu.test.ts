// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Menu from './Menu.vue';
import MenuContainer from './MenuContainer.vue';
import MenuGap from './MenuGap.vue';
import MenuItem from './MenuItem.vue';
import MenuLabel from './MenuLabel.vue';

function installPopoverPolyfill() {
  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value(this: HTMLElement) {
        this.dataset.popoverOpen = 'true';
      },
    });
  }

  if (typeof prototype.hidePopover !== 'function') {
    Object.defineProperty(prototype, 'hidePopover', {
      configurable: true,
      value(this: HTMLElement) {
        delete this.dataset.popoverOpen;
      },
    });
  }
}

describe('Menu', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders as a pure popover surface controlled by open model', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const open = ref(false);
        return () =>
          h(
            Menu,
            {
              open: open.value,
              'onUpdate:open': (nextOpen: boolean) => {
                open.value = nextOpen;
              },
            },
            {
              default: () => [
                h(MenuContainer, null, {
                  default: () => [h(MenuItem, null, { default: () => 'Edit' })],
                }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;

    expect(menu).not.toBeNull();
    expect(menu?.hidden).toBe(true);

    app.unmount();
  });

  it('emits select from slotted MenuItem and ignores disabled item', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedValues.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [
                h(MenuItem, null, { default: () => 'Edit' }),
                h(MenuItem, { disabled: true }, { default: () => 'Delete' }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    menuItems[0]?.click();
    menuItems[1]?.click();

    expect(selectedValues).toEqual(['Edit']);

    app.unmount();
  });

  it('supports vibrant color option', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          color: 'vibrant',
          open: true,
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [h(MenuItem, null, { default: () => 'Edit' })],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    expect(menu?.dataset.color).toBe('vibrant');

    app.unmount();
  });

  it('navigates across items rendered in multiple containers', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        Menu,
        {
          open: true,
        },
        {
          default: () => [
            h(MenuContainer, null, {
              default: () => [h(MenuItem, null, { default: () => 'First' })],
            }),
            h(MenuGap),
            h(MenuContainer, null, {
              default: () => [
                h(MenuLabel, null, { default: () => 'Edit' }),
                h(MenuItem, null, { default: () => 'Second' }),
                h(MenuItem, null, { default: () => 'Third' }),
              ],
            }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]');
    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    menuItems[0]?.focus();
    menu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));

    expect(document.activeElement).toBe(menuItems[1]);

    menu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));

    expect(document.activeElement).toBe(menuItems[2]);

    app.unmount();
  });
});
