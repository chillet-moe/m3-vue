// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Menu from './Menu.vue';
import MenuItem from './MenuItem.vue';

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

  it('opens and closes via the trigger button', async () => {
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
                h(MenuItem, null, { default: () => 'Edit' }),
                h(MenuItem, null, { default: () => 'Share' }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement | null;
    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;

    expect(trigger).not.toBeNull();
    expect(menu).not.toBeNull();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    trigger?.click();
    await nextTick();

    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(menu?.dataset.popoverOpen).toBe('true');

    trigger?.click();
    await nextTick();

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(menu?.dataset.popoverOpen).toBeUndefined();

    app.unmount();
  });

  it('emits select and closes when selecting enabled menu item component', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const open = ref(true);

        return () =>
          h(
            Menu,
            {
              open: open.value,
              'onUpdate:open': (nextOpen: boolean) => {
                open.value = nextOpen;
              },
              onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
                selectedValues.push(itemElement.textContent?.trim() ?? '');
              },
            },
            {
              default: () => [
                h(MenuItem, null, { default: () => 'Edit' }),
                h(MenuItem, { disabled: true }, { default: () => 'Delete' }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    expect(menuItems).toHaveLength(2);

    menuItems[0]?.click();
    await nextTick();

    expect(selectedValues).toEqual(['Edit']);

    const trigger = container.querySelector('button[aria-haspopup="menu"]');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    menuItems[1]?.click();
    await nextTick();

    expect(selectedValues).toEqual(['Edit']);

    app.unmount();
  });

  it('supports vibrant color option with slotted menu items', async () => {
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
          default: () => [h(MenuItem, null, { default: () => 'Edit' })],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const menu = container.querySelector('[role="menu"]') as HTMLDivElement | null;
    const menuItem = container.querySelector('button[role="menuitem"]') as HTMLButtonElement | null;

    expect(menu?.dataset.color).toBe('vibrant');
    expect(menuItem?.classList.contains('state-layer')).toBe(true);

    app.unmount();
  });
});
