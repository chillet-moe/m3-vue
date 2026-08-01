// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { computed, createApp, h, nextTick, ref, withDirectives } from 'vue';
import { vDropdown } from '@/directives/Menu';
import Popover from './Popover.vue';

let popoverOpenElements = new WeakSet<HTMLElement>();
let popoverTestSupportInstalled = false;

function installPopoverPolyfill() {
  if (popoverTestSupportInstalled) {
    return;
  }

  popoverTestSupportInstalled = true;

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

function isPopoverOpen(element: HTMLElement | null) {
  return element ? popoverOpenElements.has(element) : false;
}

async function flushPopover() {
  await nextTick();
  await Promise.resolve();
}

describe('Popover', () => {
  afterEach(() => {
    popoverOpenElements = new WeakSet();
    document.body.innerHTML = '';
  });

  it('renders as a controlled native popover and syncs native close', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const open = ref(true);

    const app = createApp({
      setup() {
        return () =>
          h(
            Popover,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
            },
            () => 'Popover content',
          );
      },
    });

    app.mount(container);
    await flushPopover();

    const popover = document.body.querySelector<HTMLElement>('.m3-popover');
    expect(popover?.textContent).toContain('Popover content');
    expect(popover?.parentElement).toBe(container);
    expect(isPopoverOpen(popover)).toBe(true);

    popover?.hidePopover();
    await flushPopover();

    expect(open.value).toBe(false);
    expect(isPopoverOpen(popover)).toBe(false);

    app.unmount();
  });

  it('can be opened by the dropdown directive', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const popover = ref<{ popoverEl?: HTMLDivElement } | null>(null);
        const dropdownBinding = computed(() => popover.value?.popoverEl ?? null);

        return () =>
          h('div', [
            withDirectives(h('button', { id: 'trigger' }, 'Open popover'), [[vDropdown, dropdownBinding.value]]),
            h(
              Popover,
              {
                ref: popover,
              },
              () => 'Dropdown popover',
            ),
          ]);
      },
    });

    app.mount(container);
    await flushPopover();
    await flushPopover();

    const trigger = document.querySelector<HTMLButtonElement>('#trigger');
    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPopover();

    const popover = document.body.querySelector<HTMLElement>('.m3-popover');
    expect(isPopoverOpen(popover)).toBe(true);
    expect(popover?.dataset.popoverSourceId).toBe('trigger');

    app.unmount();
  });

  it('registers an anchor name from anchorElement and passes it as source', async () => {
    installPopoverPolyfill();

    const anchor = document.createElement('button');
    anchor.id = 'manual-anchor';
    document.body.appendChild(anchor);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const open = ref(true);

    const app = createApp({
      setup() {
        return () =>
          h(
            Popover,
            {
              anchorElement: anchor,
              matchAnchorWidth: true,
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
            },
            () => 'Anchored popover',
          );
      },
    });

    app.mount(container);
    await flushPopover();

    const popover = document.body.querySelector<HTMLElement>('.m3-popover');
    const anchorName = popover?.style.getPropertyValue('position-anchor') ?? '';

    expect(anchorName).toMatch(/^--m3-popover-/);
    expect(anchor.style.getPropertyValue('anchor-name')).toContain(anchorName);
    expect(popover?.dataset.matchAnchorWidth).toBe('true');
    expect(popover?.dataset.popoverSourceId).toBe('manual-anchor');

    app.unmount();

    expect(anchor.style.getPropertyValue('anchor-name')).toBe('');
  });

  it('forwards popover attributes and placement state', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        return () =>
          h(
            Popover,
            {
              id: 'settings-popover',
              popover: 'manual',
              placement: 'top-end',
              role: 'dialog',
              ariaLabel: 'Settings',
            },
            () => 'Settings content',
          );
      },
    });

    app.mount(container);
    await flushPopover();

    const popover = document.body.querySelector<HTMLElement>('#settings-popover');

    expect(popover?.getAttribute('popover')).toBe('manual');
    expect(popover?.getAttribute('role')).toBe('dialog');
    expect(popover?.getAttribute('aria-label')).toBe('Settings');
    expect(popover?.dataset.placement).toBe('top-end');

    app.unmount();
  });
});
