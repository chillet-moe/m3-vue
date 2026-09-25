// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, type App } from 'vue';
import { OverlayHost } from '@/components/OverlayHost';
import { showPopoverStackItem } from './popoverStack';

let app: App<Element> | null = null;

function installPopoverPolyfill() {
  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value: function (this: HTMLElement) {
        this.hidden = false;
        this.dataset.popoverOpen = 'true';
      },
    });
  }

  if (typeof prototype.hidePopover !== 'function') {
    Object.defineProperty(prototype, 'hidePopover', {
      configurable: true,
      value: function (this: HTMLElement) {
        delete this.dataset.popoverOpen;
        this.hidden = true;
      },
    });
  }
}

beforeAll(() => {
  installPopoverPolyfill();
});

beforeEach(() => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  app = createApp(() => h(OverlayHost));
  app.mount(container);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  app?.unmount();
  app = null;
  document.body.innerHTML = '';
});

describe('showPopoverStackItem', () => {
  it('renders native elements and Vue components in the same stack', async () => {
    vi.useFakeTimers();

    const CustomSurface = defineComponent({
      name: 'CustomSurface',
      setup() {
        return () => h('section', { 'data-testid': 'custom-surface' }, 'Component item');
      },
    });

    const first = showPopoverStackItem({
      stackId: 'test-stack',
      render: () => h('div', { 'data-testid': 'native-surface' }, 'Native item'),
    });
    const second = showPopoverStackItem({
      stackId: 'test-stack',
      render: () => h(CustomSurface),
    });

    await nextTick();

    expect(document.querySelector('[data-testid="native-surface"]')?.textContent).toBe('Native item');
    expect(document.querySelector('[data-testid="custom-surface"]')?.textContent).toBe('Component item');
    expect(document.querySelectorAll('[popover="manual"]').length).toBe(1);

    first.close();
    await nextTick();
    await vi.advanceTimersByTimeAsync(300);

    expect(document.querySelector('[data-testid="native-surface"]')).toBeNull();
    expect(document.querySelector('[data-testid="custom-surface"]')).not.toBeNull();

    second.close();
    await nextTick();
    await vi.advanceTimersByTimeAsync(300);

    expect(document.querySelector('[data-testid="custom-surface"]')).toBeNull();
    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });
});
