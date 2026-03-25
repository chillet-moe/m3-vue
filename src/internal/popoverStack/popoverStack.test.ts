// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { showPopoverStackItem } from './popoverStack';

function installPopoverPolyfill() {
  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value: function(this: HTMLElement) {
        this.hidden = false;
        this.dataset.popoverOpen = 'true';
      },
    });
  }

  if (typeof prototype.hidePopover !== 'function') {
    Object.defineProperty(prototype, 'hidePopover', {
      configurable: true,
      value: function(this: HTMLElement) {
        delete this.dataset.popoverOpen;
        this.hidden = true;
      },
    });
  }
}

beforeAll(() => {
  installPopoverPolyfill();
});

afterEach(() => {
  vi.restoreAllMocks();
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
