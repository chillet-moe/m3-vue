// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    const motionPreference = Object.assign(new EventTarget(), { matches: false });
    const addMotionListener = vi.spyOn(motionPreference, 'addEventListener');
    const removeMotionListener = vi.spyOn(motionPreference, 'removeEventListener');
    const matchMedia = vi.fn(() => motionPreference);
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
    const restingPath = paths[0]?.getAttribute('d');
    const initialTransform = paths[0]?.style.transform;
    const flush = (timestamp: number) => {
      const current = [...callbacks.values()];
      callbacks.clear();
      current.forEach((callback) => callback(timestamp));
    };
    flush(100);
    const initialPath = paths[0]?.getAttribute('d');
    flush(165);

    const morphedPath = paths[0]?.getAttribute('d');
    expect(morphedPath).toMatch(/^m-?\d+(?:\.\d+)?(?: -?\d+(?:\.\d+)?)+ z$/);
    expect(morphedPath).not.toBe(initialPath);
    expect(paths.every((path) => path.getAttribute('d') === morphedPath)).toBe(true);
    expect(paths[0]?.style.transform).not.toBe(initialTransform);
    expect(callbacks.size).toBe(1);

    motionPreference.matches = true;
    motionPreference.dispatchEvent(new Event('change'));
    expect(
      paths.every((path) => path.getAttribute('d') === restingPath && path.style.transform === 'rotate(0deg)'),
    ).toBe(true);
    expect(callbacks.size).toBe(0);

    motionPreference.matches = false;
    motionPreference.dispatchEvent(new Event('change'));
    expect(callbacks.size).toBe(1);
    flush(300);
    expect(paths.every((path) => path.style.transform === 'rotate(0deg)')).toBe(true);
    flush(365);
    expect(paths.every((path) => path.getAttribute('d') === morphedPath)).toBe(true);

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

  it('reschedules delayed visibility in the destination document after adoption', async () => {
    vi.useFakeTimers();

    const frame = document.createElement('iframe');
    document.body.append(frame);
    const child = frame.contentDocument!;
    const childView = child.defaultView!;
    vi.spyOn(childView, 'setTimeout').mockImplementation(window.setTimeout);
    vi.spyOn(childView, 'clearTimeout').mockImplementation(window.clearTimeout);
    const state = reactive({ visible: false, showDelay: 120 });
    const { app, container, root } = await mountLoadingIndicator(state);

    state.visible = true;
    await nextTick();
    await vi.advanceTimersByTimeAsync(80);
    child.body.append(container);
    await Promise.resolve();
    await nextTick();

    await vi.advanceTimersByTimeAsync(119);
    expect(root?.dataset.visible).toBe('false');
    expect(root?.getAttribute('aria-hidden')).toBe('true');

    await vi.advanceTimersByTimeAsync(1);
    expect(root?.dataset.visible).toBe('true');
    expect(root?.hasAttribute('aria-hidden')).toBe(false);

    app.unmount();
    frame.remove();
  });
});
