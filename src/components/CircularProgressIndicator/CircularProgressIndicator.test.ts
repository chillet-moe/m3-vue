// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    expect(track).not.toBeNull();
    expect(active?.classList.contains('m3-circular-progress-indicator-active-determinate')).toBe(true);
    expect(track?.tagName.toLowerCase()).toBe('path');
    expect(active?.tagName.toLowerCase()).toBe('path');
    expect(track?.getAttribute('d')).not.toBe(active?.getAttribute('d'));

    app.unmount();
  });

  it('supports custom size, thickness, and counterclockwise direction', async ({ onTestFinished }) => {
    const documentStyle = document.documentElement.style;
    const previousFontSize = documentStyle.fontSize;
    documentStyle.fontSize = '17.5px';
    onTestFinished(() => {
      documentStyle.fontSize = previousFontSize;
    });

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
    expect(root?.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 52.5 52.5');

    app.unmount();
  });

  it('animates the displayed determinate value while exposing the real value', async () => {
    const raf = mockAnimationFrame();
    const { app, root, updateProps } = await mountCircularProgressIndicator({
      value: 0,
      min: 0,
      max: 1,
    });
    const activeArc = () => root?.querySelector('[data-part="active-indicator"]');
    const trackArc = () => root?.querySelector('[data-part="track"]')?.getAttribute('d');
    const fullTrack = trackArc();

    await updateProps({ value: 1 });

    expect(root?.getAttribute('aria-valuenow')).toBe('1');
    expect(root?.getAttribute('aria-valuetext')).toBe('100%');
    expect(activeArc()).toBeNull();
    expect(trackArc()).toBe(fullTrack);

    raf.flush(16);
    await nextTick();

    expect(root?.dataset.progressState).toBe('partial');
    expect(activeArc()?.getAttribute('d')).toMatch(/^M .+ A /);
    expect(trackArc()).toMatch(/^M .+ A /);
    expect(trackArc()).not.toBe(fullTrack);

    app.unmount();
  });

  it('settles on a full active arc during delayed animation frames', async () => {
    const raf = mockAnimationFrame();
    const { app, root, updateProps } = await mountCircularProgressIndicator({
      value: 0,
      min: 0,
      max: 1,
    });

    await updateProps({ value: 1 });

    for (let index = 1; index <= 80 && raf.pendingCount; index += 1) {
      raf.flush(index * 50);
      await nextTick();
    }

    expect(root?.dataset.progressState).toBe('complete');
    expect(root?.querySelector('[data-part="active-indicator"]')?.getAttribute('d')).toMatch(/^M .+ A .+ A /);
    expect(root?.querySelector('[data-part="track"]')).toBeNull();
    expect(raf.pendingCount).toBe(0);

    app.unmount();
  });

  it('restores the track when progress falls from complete to partial', async () => {
    const raf = mockAnimationFrame();
    const { app, root, updateProps } = await mountCircularProgressIndicator({ value: 1 });
    const trackArc = () => root?.querySelector('[data-part="track"]');

    expect(trackArc()).toBeNull();

    await updateProps({ value: 0.35 });
    raf.flush(16);
    raf.flush(66);
    await nextTick();

    const initialPath = trackArc()?.getAttribute('d');
    expect(initialPath).toMatch(/^M .+ A /);

    raf.flush(116);
    await nextTick();
    const updatedPath = trackArc()?.getAttribute('d');
    expect(updatedPath).toMatch(/^M .+ A /);
    expect(updatedPath).not.toBe(initialPath);

    await updateProps({ ariaLabel: 'Loading records' });
    expect(root?.getAttribute('aria-label')).toBe('Loading records');
    expect(trackArc()?.getAttribute('d')).toBe(updatedPath);

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
    expect(root?.querySelector('[data-part="active-indicator"]')).toBeNull();

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
