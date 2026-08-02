// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import CircularProgressIndicator from './CircularProgressIndicator.vue';

async function mountCircularProgressIndicator(props: Record<string, unknown> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const propsRef = ref(props);

  const app = createApp({
    render() {
      return h(CircularProgressIndicator, propsRef.value);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    container,
    root: container.querySelector('.m3-circular-progress-indicator') as HTMLElement | null,
    async updateProps(nextProps: Record<string, unknown>) {
      propsRef.value = {
        ...propsRef.value,
        ...nextProps,
      };
      await nextTick();
    },
  };
}

async function nextAnimationFrame() {
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

function mockAnimationFrame() {
  let requestId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    requestId += 1;
    callbacks.set(requestId, callback);
    return requestId;
  });

  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id);
  });

  return {
    get pendingCount() {
      return callbacks.size;
    },
    flush(timestamp: number) {
      const pendingCallbacks = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pendingCallbacks) {
        callback(timestamp);
      }
    },
  };
}

describe('CircularProgressIndicator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('renders a determinate circular progressbar by default', async () => {
    const { app, container, root } = await mountCircularProgressIndicator({
      value: 25,
      min: 0,
      max: 100,
      ariaLabel: 'Loading records',
    });

    const track = container.querySelector('.m3-circular-progress-indicator-track');
    const active = container.querySelector('.m3-circular-progress-indicator-active');

    expect(root).not.toBeNull();
    expect(root?.getAttribute('role')).toBe('progressbar');
    expect(root?.getAttribute('aria-label')).toBe('Loading records');
    expect(root?.getAttribute('aria-valuemin')).toBe('0');
    expect(root?.getAttribute('aria-valuemax')).toBe('100');
    expect(root?.getAttribute('aria-valuenow')).toBe('25');
    expect(root?.getAttribute('aria-valuetext')).toBe('25%');
    expect(root?.dataset.indeterminate).toBe('false');
    expect(root?.dataset.shape).toBe('flat');
    expect(root?.dataset.progressState).toBe('partial');
    expect(root?.style.getPropertyValue('--_progress')).toBe('0.25');
    expect(track).not.toBeNull();
    expect(active?.classList.contains('m3-circular-progress-indicator-active-determinate')).toBe(true);
    expect(track?.tagName.toLowerCase()).toBe('path');
    expect(active?.tagName.toLowerCase()).toBe('path');
    expect(track?.getAttribute('d')).not.toBe(active?.getAttribute('d'));

    app.unmount();
  });

  it('supports custom size, thickness, and counterclockwise direction', async () => {
    const { app, root } = await mountCircularProgressIndicator({
      value: 1,
      direction: 'counterclockwise',
      size: '3rem',
      thickness: '0.375rem',
      trackGap: '0.25rem',
    });

    expect(root?.dataset.direction).toBe('counterclockwise');
    expect(root?.dataset.progressState).toBe('complete');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-size')).toBe('3rem');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-track-thickness')).toBe('0.375rem');
    expect(root?.style.getPropertyValue('--md-circular-progress-indicator-track-active-indicator-gap')).toBe('0.25rem');

    app.unmount();
  });

  it('animates the displayed determinate value while exposing the real value', async () => {
    const { app, root, updateProps } = await mountCircularProgressIndicator({
      value: 0,
      min: 0,
      max: 1,
    });

    await updateProps({ value: 1 });

    expect(root?.getAttribute('aria-valuenow')).toBe('1');
    expect(root?.getAttribute('aria-valuetext')).toBe('100%');
    expect(root?.style.getPropertyValue('--_progress')).toBe('0');

    await nextAnimationFrame();
    await nextAnimationFrame();
    await nextTick();

    const displayedProgress = Number(root?.style.getPropertyValue('--_progress'));
    expect(displayedProgress).toBeGreaterThan(0);
    expect(displayedProgress).not.toBe(1);

    app.unmount();
  });

  it('keeps the displayed determinate progress bounded during delayed animation frames', async () => {
    const raf = mockAnimationFrame();
    const { app, root, updateProps } = await mountCircularProgressIndicator({
      value: 0,
      min: 0,
      max: 1,
    });

    await updateProps({ value: 1 });

    for (let index = 1; index <= 80; index += 1) {
      raf.flush(index * 50);
      await nextTick();

      const displayedProgress = Number(root?.style.getPropertyValue('--_progress'));
      expect(Number.isFinite(displayedProgress)).toBe(true);
      expect(displayedProgress).toBeGreaterThanOrEqual(0);
      expect(displayedProgress).toBeLessThanOrEqual(1);
    }

    expect(Number(root?.style.getPropertyValue('--_progress'))).toBeCloseTo(1, 3);

    app.unmount();
  });

  it('renders an indeterminate advance animation without determinate aria values', async () => {
    const { app, container, root } = await mountCircularProgressIndicator({
      indeterminate: true,
      ariaValueText: 'Loading',
    });

    const active = container.querySelector('.m3-circular-progress-indicator-active');

    expect(root?.dataset.indeterminate).toBe('true');
    expect(root?.getAttribute('aria-valuemin')).toBeNull();
    expect(root?.getAttribute('aria-valuemax')).toBeNull();
    expect(root?.getAttribute('aria-valuenow')).toBeNull();
    expect(root?.getAttribute('aria-valuetext')).toBe('Loading');
    expect(container.querySelector('.m3-circular-progress-indicator-track')).not.toBeNull();
    expect(active?.classList.contains('m3-circular-progress-indicator-active-indeterminate')).toBe(true);

    app.unmount();
  });

  it('shares one browser frame across many indeterminate instances and writes paths directly', async () => {
    const raf = mockAnimationFrame();
    const indeterminate = ref(true);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const app = createApp({
      render: () =>
        h(
          'div',
          Array.from({ length: 100 }, () => h(CircularProgressIndicator, { indeterminate: indeterminate.value })),
        ),
    });

    app.mount(container);
    await nextTick();
    expect(raf.pendingCount).toBe(1);

    const active = container.querySelector<SVGPathElement>('.m3-circular-progress-indicator-active')!;
    const initialPath = active.getAttribute('d');
    raf.flush(100);
    raf.flush(400);

    expect(active.getAttribute('d')).not.toBe(initialPath);
    expect(raf.pendingCount).toBe(1);

    indeterminate.value = false;
    await nextTick();
    expect(raf.pendingCount).toBe(0);

    app.unmount();
  });

  it('uses current wavy geometry in the direct indeterminate presentation', async () => {
    const raf = mockAnimationFrame();
    const { app, container, updateProps } = await mountCircularProgressIndicator({ indeterminate: true });
    const active = container.querySelector<SVGPathElement>('.m3-circular-progress-indicator-active')!;

    raf.flush(100);
    raf.flush(400);
    expect(active.getAttribute('d')).toContain('A');

    await updateProps({ shape: 'wavy', size: '3rem' });
    raf.flush(700);
    expect(active.getAttribute('d')).toContain('C');

    app.unmount();
  });

  it('hides the determinate active arc at zero progress', async () => {
    const { app, root } = await mountCircularProgressIndicator({
      value: -1,
      min: 0,
      max: 1,
    });

    expect(root?.getAttribute('aria-valuenow')).toBe('0');
    expect(root?.dataset.progressState).toBe('empty');
    expect(root?.style.getPropertyValue('--_progress')).toBe('0');

    app.unmount();
  });

  it('renders a wavy active arc as a cubic path while keeping the track as a separate arc', async () => {
    const { app, container, root } = await mountCircularProgressIndicator({
      value: 0.5,
      shape: 'wavy',
    });

    const track = container.querySelector('.m3-circular-progress-indicator-track');
    const active = container.querySelector('.m3-circular-progress-indicator-active');

    expect(root?.dataset.shape).toBe('wavy');
    expect(track?.getAttribute('d')).toContain('A');
    expect(active?.getAttribute('d')).toContain('C');
    expect(track?.getAttribute('d')).not.toBe(active?.getAttribute('d'));

    app.unmount();
  });
});
