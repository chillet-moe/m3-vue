// @vitest-environment jsdom
import { createOverlayHost } from '@/internal/overlayHost/overlayHost';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { OverlayHost } from '@/components/OverlayHost';
import { showPopoverStackItem } from './popoverStack';

const overlayHost = createOverlayHost();
let app: App<Element> | null = null;

beforeAll(() => {
  // JSDOM has no top layer; native visibility is covered by browser tests.
  Object.defineProperties(HTMLElement.prototype, {
    showPopover: { configurable: true, value() {} },
    hidePopover: { configurable: true, value() {} },
  });
});

beforeEach(() => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  app = createApp(() => h(OverlayHost, { host: overlayHost }));
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

    const first = showPopoverStackItem(overlayHost, {
      stackId: 'test-stack',
      render: () => h('div', { 'data-testid': 'native-surface' }, 'Native item'),
    });
    const second = showPopoverStackItem(overlayHost, {
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

  it('preserves a focused entry and updates its content as other entries leave and enter', async () => {
    vi.useFakeTimers();
    const label = ref('Original label');
    const first = showPopoverStackItem(overlayHost, {
      stackId: 'test-stack',
      render: () => h('span', 'First item'),
    });
    showPopoverStackItem(overlayHost, {
      stackId: 'test-stack',
      render: () => h('input', { 'aria-label': label.value }),
    });
    await nextTick();

    const input = document.querySelector('input')!;
    input.focus();
    input.value = 'Unsubmitted text';

    first.close();
    showPopoverStackItem(overlayHost, {
      stackId: 'test-stack',
      render: () => h('span', 'Last item'),
    });
    label.value = 'Updated label';
    await vi.advanceTimersByTimeAsync(300);

    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-label')).toBe('Updated label');
    expect(input.value).toBe('Unsubmitted text');
    expect(document.querySelector('[popover="manual"]')?.textContent).toBe('Last item');
  });

  it('keeps a new entry queued between the final removal and stack teardown', async () => {
    const first = showPopoverStackItem(overlayHost, {
      stackId: 'test-stack',
      render: () => h('span', 'First item'),
    });
    await nextTick();
    const popover = document.querySelector('[popover="manual"]')!;

    first.close();
    await nextTick();
    // The close callback queues removal. Enqueue after that removal but before its teardown check.
    const successor = await Promise.resolve().then(() =>
      showPopoverStackItem(overlayHost, {
        stackId: 'test-stack',
        render: () => h('span', 'Successor'),
      }),
    );
    await nextTick();

    expect(document.querySelector('[popover="manual"]')).toBe(popover);
    expect(popover.textContent).toBe('Successor');

    successor.close();
    await vi.waitFor(() => expect(document.querySelector('[popover="manual"]')).toBeNull());
  });
});
