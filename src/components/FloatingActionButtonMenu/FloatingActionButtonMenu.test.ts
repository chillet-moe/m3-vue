// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import FloatingActionButtonMenu from './FloatingActionButtonMenu.vue';
import FloatingActionButtonMenuItem from './FloatingActionButtonMenuItem.vue';

const popoverOpenElements = new WeakSet<HTMLElement>();
let popoverPolyfillInstalled = false;

function installPopoverPolyfill() {
  if (popoverPolyfillInstalled) return;
  popoverPolyfillInstalled = true;

  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: (options?: { source?: HTMLElement }) => void;
    hidePopover?: () => void;
  };

  const originalMatches = Element.prototype.matches;

  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenElements.has(this as HTMLElement);
    }

    return originalMatches.call(this, selector);
  } as typeof Element.prototype.matches;

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value(this: HTMLElement, options?: { source?: HTMLElement }) {
        if (options?.source) {
          this.dataset.popoverSourceId =
            options.source.id ||
            options.source.textContent?.trim() ||
            options.source.getAttribute('aria-label') ||
            'source';
        }

        popoverOpenElements.add(this);
        const toggleEvent = new Event('toggle');
        Object.defineProperty(toggleEvent, 'newState', {
          configurable: true,
          value: 'open',
        });
        this.dispatchEvent(toggleEvent);
      },
    });
  }

  if (typeof prototype.hidePopover !== 'function') {
    Object.defineProperty(prototype, 'hidePopover', {
      configurable: true,
      value(this: HTMLElement) {
        popoverOpenElements.delete(this);
        delete this.dataset.popoverSourceId;
        const toggleEvent = new Event('toggle');
        Object.defineProperty(toggleEvent, 'newState', {
          configurable: true,
          value: 'closed',
        });
        this.dispatchEvent(toggleEvent);
      },
    });
  }
}

function isPopoverOpen(element: HTMLElement | null) {
  return element ? popoverOpenElements.has(element) : false;
}

async function flushPopover() {
  await nextTick();
  await nextTick();
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('FloatingActionButtonMenu', () => {
  it('renders a closed trigger FAB and menu items', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        FloatingActionButtonMenu,
        {
          color: 'secondary',
          size: 'medium',
          ariaLabel: 'Actions',
        },
        {
          default: () => [
            h(FloatingActionButtonMenuItem, { icon: 'edit' }, { default: () => 'Edit' }),
            h(FloatingActionButtonMenuItem, { icon: 'delete' }, { default: () => 'Delete' }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-fab-menu');
    const trigger = container.querySelector<HTMLButtonElement>('.m3-fab-menu-trigger');
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const items = container.querySelectorAll<HTMLElement>('[role="menuitem"]');

    expect(root?.dataset.color).toBe('secondary');
    expect(root?.dataset.size).toBe('medium');
    expect(root?.dataset.open).toBe('false');
    expect(trigger?.getAttribute('aria-label')).toBe('Actions');
    expect(isPopoverOpen(menu)).toBe(false);
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toContain('Edit');

    app.unmount();
  });

  it('opens and closes from the same trigger button', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const onClosed = vi.fn();

    const app = createApp(() =>
      h(
        FloatingActionButtonMenu,
        {
          ariaLabel: 'Create',
          onClosed,
        },
        {
          default: () => [h(FloatingActionButtonMenuItem, { icon: 'mail' }, { default: () => 'Message' })],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-fab-menu');
    const trigger = container.querySelector<HTMLButtonElement>('.m3-fab-menu-trigger');
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const triggerIcon = container.querySelector<HTMLElement>('.m3-fab-menu-trigger-icon');
    const closeIcon = container.querySelector<HTMLElement>('.m3-fab-menu-close-icon');

    trigger?.click();
    await flushPopover();

    expect(root?.dataset.open).toBe('true');
    expect(trigger?.dataset.open).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(triggerIcon?.dataset.visible).toBe('false');
    expect(closeIcon?.dataset.visible).toBe('true');
    expect(isPopoverOpen(menu)).toBe(true);
    expect(menu?.dataset.popoverSourceId).toBe(trigger?.id);

    let finishExit!: () => void;
    const exitFinished = new Promise<void>((resolve) => {
      finishExit = resolve;
    });
    Object.defineProperty(menu as HTMLElement, 'getAnimations', {
      configurable: true,
      value: () => [{ finished: exitFinished }],
    });

    trigger?.click();
    await flushPopover();

    expect(root?.dataset.open).toBe('false');
    expect(isPopoverOpen(menu)).toBe(false);
    expect(onClosed).not.toHaveBeenCalled();

    finishExit();
    await exitFinished;
    await Promise.resolve();

    expect(onClosed).toHaveBeenCalledOnce();

    app.unmount();
  });

  it('only installs dismissal and viewport listeners while open', async () => {
    installPopoverPolyfill();
    const windowAdd = vi.spyOn(window, 'addEventListener');
    const windowRemove = vi.spyOn(window, 'removeEventListener');
    const documentAdd = vi.spyOn(document, 'addEventListener');
    const documentRemove = vi.spyOn(document, 'removeEventListener');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(FloatingActionButtonMenu));
    app.mount(container);
    await nextTick();
    const trigger = container.querySelector<HTMLButtonElement>('.m3-fab-menu-trigger')!;
    const initialPointerDownListeners = documentAdd.mock.calls.filter(([type]) => type === 'pointerdown').length;

    expect(windowAdd.mock.calls.filter(([type]) => type === 'resize' || type === 'scroll')).toHaveLength(0);

    trigger.click();
    await flushPopover();
    expect(windowAdd.mock.calls.filter(([type]) => type === 'resize' || type === 'scroll')).toHaveLength(2);
    expect(documentAdd.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(
      initialPointerDownListeners + 1,
    );

    trigger.click();
    await flushPopover();
    expect(windowRemove.mock.calls.filter(([type]) => type === 'resize' || type === 'scroll')).toHaveLength(2);
    expect(documentRemove.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(1);

    app.unmount();
  });

  it('positions menu items above the morphing trigger despite surface inline padding', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        FloatingActionButtonMenu,
        {
          alignment: 'end',
        },
        {
          default: () => [h(FloatingActionButtonMenuItem, { icon: 'mail' }, { default: () => 'Message' })],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLButtonElement>('.m3-fab-menu-trigger');
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const surface = container.querySelector<HTMLElement>('.m3-fab-menu-surface');

    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(trigger as HTMLButtonElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 72,
        y: 520,
        top: 520,
        right: 128,
        bottom: 576,
        left: 72,
        width: 56,
        height: 56,
        toJSON: () => null,
      }),
    });
    Object.defineProperty(surface as HTMLElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 52,
        y: 320,
        top: 320,
        right: 180,
        bottom: 512,
        left: 52,
        width: 128,
        height: 192,
        toJSON: () => null,
      }),
    });
    surface?.style.setProperty('padding-inline-start', '12px');
    surface?.style.setProperty('padding-inline-end', '20px');
    surface?.style.setProperty('row-gap', '8px');

    trigger?.click();
    await flushPopover();

    expect(menu?.style.getPropertyValue('--_fab-menu-popover-inline-start')).toBe('20px');
    expect(menu?.style.getPropertyValue('--_fab-menu-popover-block-end')).toBe('88px');
    expect(menu?.dataset.effectiveAlignment).toBe('end');

    app.unmount();

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('flips effective alignment when the preferred side would overflow the viewport', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        FloatingActionButtonMenu,
        {
          alignment: 'end',
        },
        {
          default: () => [h(FloatingActionButtonMenuItem, { icon: 'mail' }, { default: () => 'Message' })],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLButtonElement>('.m3-fab-menu-trigger');
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const surface = container.querySelector<HTMLElement>('.m3-fab-menu-surface');

    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(trigger as HTMLButtonElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 20,
        y: 520,
        top: 520,
        right: 76,
        bottom: 576,
        left: 20,
        width: 56,
        height: 56,
        toJSON: () => null,
      }),
    });
    Object.defineProperty(surface as HTMLElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 320,
        top: 320,
        right: 180,
        bottom: 512,
        left: 0,
        width: 180,
        height: 192,
        toJSON: () => null,
      }),
    });
    surface?.style.setProperty('padding-inline-end', '20px');
    surface?.style.setProperty('padding-inline-start', '12px');

    trigger?.click();
    await flushPopover();

    expect(menu?.style.getPropertyValue('--_fab-menu-popover-inline-start')).toBe('8px');
    expect(menu?.dataset.alignment).toBe('end');
    expect(menu?.dataset.effectiveAlignment).toBe('start');

    app.unmount();

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('positions non-regular sizes from the final close FAB edge', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        FloatingActionButtonMenu,
        {
          size: 'large',
          alignment: 'end',
        },
        {
          default: () => [h(FloatingActionButtonMenuItem, { icon: 'mail' }, { default: () => 'Message' })],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-fab-menu');
    const trigger = container.querySelector<HTMLButtonElement>('.m3-fab-menu-trigger');
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const surface = container.querySelector<HTMLElement>('.m3-fab-menu-surface');

    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(root as HTMLElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 400,
        y: 480,
        top: 480,
        right: 496,
        bottom: 576,
        left: 400,
        width: 96,
        height: 96,
        toJSON: () => null,
      }),
    });
    Object.defineProperty(trigger as HTMLButtonElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 400,
        y: 480,
        top: 480,
        right: 496,
        bottom: 576,
        left: 400,
        width: 96,
        height: 96,
        toJSON: () => null,
      }),
    });
    Object.defineProperty(surface as HTMLElement, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 352,
        y: 320,
        top: 320,
        right: 512,
        bottom: 512,
        left: 352,
        width: 160,
        height: 192,
        toJSON: () => null,
      }),
    });
    trigger?.style.setProperty('--_fab-menu-close-button-container-width', '56px');
    trigger?.style.setProperty('--_fab-menu-close-button-container-height', '56px');
    surface?.style.setProperty('padding-inline-end', '16px');
    surface?.style.setProperty('row-gap', '8px');

    trigger?.click();
    await flushPopover();

    expect(menu?.style.getPropertyValue('--_fab-menu-popover-inline-start')).toBe('352px');
    expect(menu?.style.getPropertyValue('--_fab-menu-popover-block-end')).toBe('88px');

    app.unmount();

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('emits select for enabled items and closes by default', async () => {
    installPopoverPolyfill();

    const selectedItems: string[] = [];
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        FloatingActionButtonMenu,
        {
          open: true,
          onSelect: (_event: MouseEvent, itemElement: HTMLElement) => {
            selectedItems.push(itemElement.textContent?.trim() ?? '');
          },
        },
        {
          default: () => [
            h(FloatingActionButtonMenuItem, { icon: 'archive' }, { default: () => 'Archive' }),
            h(FloatingActionButtonMenuItem, { icon: 'delete', disabled: true }, { default: () => 'Delete' }),
          ],
        },
      ),
    );

    app.mount(container);
    await flushPopover();

    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const items = container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');

    expect(isPopoverOpen(menu)).toBe(true);

    items[1]?.click();
    await flushPopover();

    expect(selectedItems).toEqual([]);
    expect(isPopoverOpen(menu)).toBe(true);

    items[0]?.click();
    await flushPopover();

    expect(selectedItems[0]).toContain('Archive');
    expect(isPopoverOpen(menu)).toBe(false);

    app.unmount();
  });

  it('supports controlled open state and keyboard navigation', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const open = ref(false);

        return () =>
          h(
            FloatingActionButtonMenu,
            {
              open: open.value,
              'onUpdate:open': (nextOpen: boolean) => {
                open.value = nextOpen;
              },
            },
            {
              default: () => [
                h(FloatingActionButtonMenuItem, { icon: 'reply' }, { default: () => 'Reply' }),
                h(FloatingActionButtonMenuItem, { icon: 'forward' }, { default: () => 'Forward' }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLButtonElement>('.m3-fab-menu-trigger');
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const items = container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');

    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    await flushPopover();

    expect(isPopoverOpen(menu)).toBe(true);
    expect(document.activeElement).toBe(items[0]);

    menu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    expect(document.activeElement).toBe(items[1]);

    menu?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    await flushPopover();

    expect(isPopoverOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);

    app.unmount();
  });
});
