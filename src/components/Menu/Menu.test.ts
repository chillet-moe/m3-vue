// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Menu from './Menu.vue';

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
          h(Menu, {
            open: open.value,
            'onUpdate:open': (nextOpen: boolean) => {
              open.value = nextOpen;
            },
            items: [
              { label: 'Edit', value: 'edit' },
              { label: 'Share', value: 'share' },
            ],
          });
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

  it('emits select and closes when selecting enabled item', async () => {
    installPopoverPolyfill();

    const selectedValues: string[] = [];

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const open = ref(true);

        return () =>
          h(Menu, {
            open: open.value,
            'onUpdate:open': (nextOpen: boolean) => {
              open.value = nextOpen;
            },
            items: [
              { label: 'Edit', value: 'edit' },
              { label: 'Delete', value: 'delete', disabled: true },
            ],
            onSelect: (item: { value: string }) => {
              selectedValues.push(item.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');

    expect(menuItems).toHaveLength(2);

    menuItems[0]?.click();
    await nextTick();

    expect(selectedValues).toEqual(['edit']);

    const trigger = container.querySelector('button[aria-haspopup="menu"]');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    menuItems[1]?.click();
    await nextTick();

    expect(selectedValues).toEqual(['edit']);

    app.unmount();
  });
});
