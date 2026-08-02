// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, reactive } from 'vue';
import LoadingIndicator from './LoadingIndicator.vue';

async function mountLoadingIndicator(props: Record<string, unknown> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const app = createApp({
    render() {
      return h(LoadingIndicator, props);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    container,
    root: container.querySelector('.m3-loading-indicator') as HTMLElement | null,
  };
}

describe('LoadingIndicator', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('shares one animation frame and motion preference listener across many instances', async () => {
    let requestId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const id = ++requestId;
      callbacks.set(id, callback);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => callbacks.delete(id));
    const addMotionListener = vi.fn();
    const removeMotionListener = vi.fn();
    const matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: addMotionListener,
      removeEventListener: removeMotionListener,
    }));
    vi.stubGlobal('matchMedia', matchMedia);
    const visible = reactive({ value: true });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const app = createApp({
      render: () =>
        h(
          'div',
          Array.from({ length: 100 }, () => h(LoadingIndicator, { visible: visible.value })),
        ),
    });

    app.mount(container);
    await nextTick();

    expect(callbacks.size).toBe(1);
    expect(matchMedia).toHaveBeenCalledTimes(1);
    expect(addMotionListener).toHaveBeenCalledTimes(1);

    const paths = Array.from(container.querySelectorAll<SVGPathElement>('[data-part="active-indicator"]'));
    const initialTransform = paths[0]?.style.transform;
    const flush = (timestamp: number) => {
      const current = [...callbacks.values()];
      callbacks.clear();
      current.forEach((callback) => callback(timestamp));
    };
    flush(100);
    flush(400);

    expect(paths.every((path) => path.getAttribute('d') === paths[0]?.getAttribute('d'))).toBe(true);
    expect(paths[0]?.style.transform).not.toBe(initialTransform);
    expect(callbacks.size).toBe(1);

    visible.value = false;
    await nextTick();
    expect(callbacks.size).toBe(0);

    app.unmount();
    expect(removeMotionListener).toHaveBeenCalledTimes(1);
  });

  it('renders an indeterminate uncontained progressbar by default', async () => {
    const { app, container, root } = await mountLoadingIndicator({
      ariaLabel: 'Loading records',
    });

    const active = container.querySelector('[data-part="active-indicator"]');

    expect(root).not.toBeNull();
    expect(root?.getAttribute('role')).toBe('progressbar');
    expect(root?.getAttribute('aria-label')).toBe('Loading records');
    expect(root?.getAttribute('aria-valuemin')).toBeNull();
    expect(root?.getAttribute('aria-valuemax')).toBeNull();
    expect(root?.getAttribute('aria-valuenow')).toBeNull();
    expect(root?.dataset.indeterminate).toBe('true');
    expect(root?.dataset.variant).toBe('uncontained');
    expect(root?.dataset.visible).toBe('true');
    expect(container.querySelector('[data-part="container"]')).not.toBeNull();
    expect(active?.getAttribute('d')).toMatch(/^m/);
    expect(active?.getAttribute('d')).toContain(' z');

    app.unmount();
  });

  it('supports the contained configuration and custom dimensions', async () => {
    const { app, root } = await mountLoadingIndicator({
      variant: 'contained',
      indicatorSize: '2rem',
      containerSize: '3rem',
      containerWidth: '3.5rem',
    });

    expect(root?.dataset.variant).toBe('contained');
    expect(root?.style.getPropertyValue('--md-loading-indicator-active-indicator-size')).toBe('2rem');
    expect(root?.style.getPropertyValue('--md-loading-indicator-container-width')).toBe('3.5rem');
    expect(root?.style.getPropertyValue('--md-loading-indicator-container-height')).toBe('3rem');

    app.unmount();
  });

  it('keeps layout space but hides accessibility when visible is false', async () => {
    const { app, root } = await mountLoadingIndicator({
      visible: false,
    });

    expect(root?.dataset.visible).toBe('false');
    expect(root?.getAttribute('aria-hidden')).toBe('true');

    app.unmount();
  });

  it('applies showDelay when visibility changes to true', async () => {
    vi.useFakeTimers();

    const state = reactive({
      visible: false,
      showDelay: 120,
    });
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(LoadingIndicator, state);
      },
    });

    app.mount(container);
    await nextTick();

    const root = container.querySelector('.m3-loading-indicator') as HTMLElement | null;
    expect(root?.dataset.visible).toBe('false');

    state.visible = true;
    await nextTick();
    expect(root?.dataset.visible).toBe('false');

    await vi.advanceTimersByTimeAsync(120);
    await nextTick();
    expect(root?.dataset.visible).toBe('true');

    app.unmount();
  });
});
