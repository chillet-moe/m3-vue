// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import LinearProgressIndicator from './LinearProgressIndicator.vue';

const progressProperty = '--m3-linear-progress-displayed-value';

async function mountLinearProgressIndicator(props: Record<string, unknown> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const propsRef = ref(props);

  const app = createApp({
    render() {
      return h(LinearProgressIndicator, propsRef.value);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    container,
    root: container.querySelector('.m3-linear-progress-indicator') as HTMLElement | null,
    track: container.querySelector<HTMLElement>('[data-part="track"]')!,
    async updateProps(nextProps: Record<string, unknown>) {
      propsRef.value = {
        ...propsRef.value,
        ...nextProps,
      };
      await nextTick();
    },
  };
}

function mockAnimationFrame(view: Window = window) {
  let requestId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();

  vi.spyOn(view, 'requestAnimationFrame').mockImplementation((callback) => {
    requestId += 1;
    callbacks.set(requestId, callback);
    return requestId;
  });

  vi.spyOn(view, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id);
  });

  return {
    flush(timestamp: number) {
      const pendingCallbacks = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pendingCallbacks) {
        callback(timestamp);
      }
    },
  };
}

describe('LinearProgressIndicator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('skips layout reads and resize observation for the default flat shape', async () => {
    const ResizeObserver = vi.fn(
      class {
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.stubGlobal('ResizeObserver', ResizeObserver);
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle');
    const getBoundingClientRect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');

    const { app } = await mountLinearProgressIndicator({ value: 0.5 });
    await nextTick();

    expect(ResizeObserver).not.toHaveBeenCalled();
    expect(getComputedStyle).not.toHaveBeenCalled();
    expect(getBoundingClientRect).not.toHaveBeenCalled();

    app.unmount();
  });

  it('updates wavy geometry when another indicator stops tracking layout', async () => {
    let notify!: ResizeObserverCallback;
    const disconnect = vi.fn();
    const observe = vi.fn();
    const unobserve = vi.fn();
    const ResizeObserver = vi.fn(
      class {
        constructor(callback: ResizeObserverCallback) {
          notify = callback;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = disconnect;
      },
    );
    vi.stubGlobal('ResizeObserver', ResizeObserver);

    const first = await mountLinearProgressIndicator({ value: 0.5 });
    const second = await mountLinearProgressIndicator({ value: 0.75 });
    const firstBounds = vi
      .spyOn(first.root!, 'getBoundingClientRect')
      .mockReturnValue(DOMRect.fromRect({ width: 100 }));
    const secondBounds = vi
      .spyOn(second.root!, 'getBoundingClientRect')
      .mockReturnValue(DOMRect.fromRect({ width: 140 }));
    const viewBox = (root: HTMLElement | null) => root?.querySelector('svg')?.getAttribute('viewBox');

    await first.updateProps({ shape: 'wavy' });
    await second.updateProps({ shape: 'wavy' });
    await nextTick();
    expect(ResizeObserver).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledWith(first.root);
    expect(observe).toHaveBeenCalledWith(second.root);
    expect(viewBox(first.root)).toBe('0 0 100 10');
    expect(viewBox(second.root)).toBe('0 0 140 10');

    firstBounds.mockReturnValue(DOMRect.fromRect({ width: 125.5 }));
    secondBounds.mockReturnValue(DOMRect.fromRect({ width: 160.5 }));
    const entries = [first.root!, second.root!].map((target) => ({
      target,
      contentRect: target.getBoundingClientRect(),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    }));
    const observer: ResizeObserver = ResizeObserver.mock.instances[0];
    notify(entries, observer);
    await nextTick();
    expect(viewBox(first.root)).toBe('0 0 125.5 10');
    expect(viewBox(second.root)).toBe('0 0 160.5 10');

    await first.updateProps({ shape: 'flat' });
    await nextTick();
    expect(unobserve).toHaveBeenCalledWith(first.root);
    expect(disconnect).not.toHaveBeenCalled();
    first.app.unmount();

    secondBounds.mockReturnValue(DOMRect.fromRect({ width: 200 }));
    notify(entries, observer);
    await nextTick();
    expect(viewBox(second.root)).toBe('0 0 200 10');

    second.app.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('renders a determinate progressbar by default', async () => {
    const { app, container, root } = await mountLinearProgressIndicator({
      value: 3,
      min: 0,
      max: 10,
      ariaLabel: 'Loading records',
    });

    expect(root).not.toBeNull();
    expect(root?.getAttribute('role')).toBe('progressbar');
    expect(root?.getAttribute('aria-label')).toBe('Loading records');
    expect(root?.getAttribute('aria-valuemin')).toBe('0');
    expect(root?.getAttribute('aria-valuemax')).toBe('10');
    expect(root?.getAttribute('aria-valuenow')).toBe('3');
    expect(root?.getAttribute('aria-valuetext')).toBe('30%');
    expect(root?.dataset.indeterminate).toBe('false');
    expect(root?.dataset.shape).toBe('flat');
    expect(root?.dataset.progressState).toBe('partial');
    expect(root?.style.getPropertyValue('--_progress')).toBe('0.3');
    expect(container.querySelector('[data-part="track"]')).not.toBeNull();
    expect(container.querySelector('[data-part="active-indicator"]')).not.toBeNull();
    expect(container.querySelector('[data-part="stop-indicator"]')).not.toBeNull();

    app.unmount();
  });

  it('clamps determinate values and allows custom dimensions', async () => {
    const { app, root } = await mountLinearProgressIndicator({
      value: 14,
      min: 0,
      max: 10,
      thickness: '0.5rem',
      trackGap: '0.25rem',
      stopIndicatorSize: '0.75rem',
    });

    expect(root?.getAttribute('aria-valuenow')).toBe('10');
    expect(root?.getAttribute('aria-valuetext')).toBe('100%');
    expect(root?.dataset.progressState).toBe('complete');
    expect(root?.style.getPropertyValue('--_progress')).toBe('1');
    expect(root?.style.getPropertyValue('--md-linear-progress-indicator-track-thickness')).toBe('0.5rem');
    expect(root?.style.getPropertyValue('--md-linear-progress-indicator-track-active-indicator-gap')).toBe('0.25rem');
    expect(root?.style.getPropertyValue('--md-linear-progress-indicator-stop-indicator-size')).toBe('0.75rem');

    app.unmount();
  });

  it('animates the displayed determinate value while exposing the real value', async () => {
    const raf = mockAnimationFrame();
    const { app, root, track, updateProps } = await mountLinearProgressIndicator({
      value: 0,
      min: 0,
      max: 1,
    });

    await updateProps({ value: 1 });

    expect(root?.getAttribute('aria-valuenow')).toBe('1');
    expect(root?.getAttribute('aria-valuetext')).toBe('100%');
    expect(root?.style.getPropertyValue('--_progress')).toBe('0');

    raf.flush(16);
    await nextTick();

    const displayedProgress = track.style.getPropertyValue(progressProperty);
    const active = root!.querySelector<HTMLElement>('[data-part="active-indicator"]')!;
    expect(Number(displayedProgress)).toBeGreaterThan(0);
    expect(Number(displayedProgress)).toBeLessThan(1);
    expect(active.style.getPropertyValue(progressProperty)).toBe(displayedProgress);

    const progressDuringUpdate = new Set([displayedProgress]);
    const previousStyle = document.createElement('div').style;
    const observer = new MutationObserver((records) => {
      for (const { oldValue } of records) {
        previousStyle.cssText = oldValue ?? '';
        progressDuringUpdate.add(previousStyle.getPropertyValue(progressProperty));
      }
    });
    const observeStyle = { attributes: true, attributeFilter: ['style'], attributeOldValue: true };
    observer.observe(track, observeStyle);
    observer.observe(active, observeStyle);

    await updateProps({
      thickness: '6px',
      style: { maxWidth: '18rem' },
    });
    observer.disconnect();

    expect(progressDuringUpdate).toEqual(new Set([displayedProgress]));
    expect(track.style.getPropertyValue(progressProperty)).toBe(displayedProgress);
    expect(active.style.getPropertyValue(progressProperty)).toBe(displayedProgress);
    expect(root?.style.getPropertyValue('--md-linear-progress-indicator-track-thickness')).toBe('6px');
    expect(root?.style.maxWidth).toBe('18rem');

    app.unmount();
  });

  it('keeps the displayed determinate progress bounded during delayed animation frames', async () => {
    const raf = mockAnimationFrame();
    const { app, track, updateProps } = await mountLinearProgressIndicator({
      value: 0,
      min: 0,
      max: 1,
    });

    await updateProps({ value: 1 });

    for (let index = 1; index <= 80; index += 1) {
      raf.flush(index * 50);
      await nextTick();

      const displayedProgress = Number(track.style.getPropertyValue(progressProperty));
      expect(Number.isFinite(displayedProgress)).toBe(true);
      expect(displayedProgress).toBeGreaterThanOrEqual(0);
      expect(displayedProgress).toBeLessThanOrEqual(1);
    }

    expect(Number(track.style.getPropertyValue(progressProperty))).toBeCloseTo(1, 3);

    app.unmount();
  });

  it('continues wavy progress on the destination clock and geometry after adoption', async () => {
    const sourceRaf = mockAnimationFrame();
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const destination = frame.contentDocument!;
    const destinationRaf = mockAnimationFrame(destination.defaultView!);
    const { app, container, root, track, updateProps } = await mountLinearProgressIndicator({
      shape: 'wavy',
      value: 0,
    });
    vi.spyOn(root!, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 120 }));
    await updateProps({ value: 1 });
    sourceRaf.flush(16);
    await nextTick();
    const beforeMove = Number(track.style.getPropertyValue(progressProperty));

    destination.body.append(container);
    await Promise.resolve();
    await nextTick();
    sourceRaf.flush(32);
    await nextTick();
    expect(Number(track.style.getPropertyValue(progressProperty))).toBe(beforeMove);
    expect(root?.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 120 10');

    destinationRaf.flush(16);
    await nextTick();
    const afterMove = Number(track.style.getPropertyValue(progressProperty));
    expect(afterMove).toBeGreaterThan(beforeMove);
    expect(afterMove).toBeLessThan(1);
    expect(root?.getAttribute('aria-valuenow')).toBe('1');

    app.unmount();
    frame.remove();
  });

  it('renders indeterminate disjoint segments without determinate aria values', async () => {
    const { app, container, root } = await mountLinearProgressIndicator({
      indeterminate: true,
      direction: 'rtl',
      ariaValueText: 'Loading',
    });

    expect(root?.dataset.indeterminate).toBe('true');
    expect(root?.dataset.direction).toBe('rtl');
    expect(root?.getAttribute('aria-valuemin')).toBeNull();
    expect(root?.getAttribute('aria-valuemax')).toBeNull();
    expect(root?.getAttribute('aria-valuenow')).toBeNull();
    expect(root?.getAttribute('aria-valuetext')).toBe('Loading');
    expect(container.querySelectorAll('.m3-linear-progress-indicator-active-indeterminate')).toHaveLength(2);
    expect(container.querySelector('[data-part="stop-indicator"]')).toBeNull();

    app.unmount();
  });

  it('uses the current progress on the active segment when returning to determinate mode', async () => {
    const { app, root, track, updateProps } = await mountLinearProgressIndicator({ value: 0.2 });

    await updateProps({ indeterminate: true, value: 0.65 });
    await updateProps({ indeterminate: false });

    const active = root!.querySelector<HTMLElement>('[data-part="active-indicator"]')!;
    const activeProgress =
      active.style.getPropertyValue(progressProperty) || root?.style.getPropertyValue('--_progress');
    expect(root?.getAttribute('aria-valuenow')).toBe('0.65');
    expect(activeProgress).toBe('0.65');
    expect(track.style.getPropertyValue(progressProperty)).toBe('0.65');

    app.unmount();
  });

  it('can hide the stop indicator', async () => {
    const { app, container } = await mountLinearProgressIndicator({
      value: 0.4,
      stopIndicator: false,
    });

    expect(container.querySelector('[data-part="stop-indicator"]')).toBeNull();

    app.unmount();
  });

  it('renders a source-shaped wavy active indicator path', async () => {
    const { app, container, root } = await mountLinearProgressIndicator({
      value: 0.5,
      shape: 'wavy',
    });

    const wavy = container.querySelector('[data-part="active-indicator-wavy"]');
    const path = wavy?.querySelector('path');

    expect(root?.dataset.shape).toBe('wavy');
    expect(wavy).not.toBeNull();
    expect(path?.getAttribute('d')).toContain('C');

    app.unmount();
  });
});
