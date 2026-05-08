// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import Slider from './Slider.vue';

function createRect(rect: Partial<DOMRect> = {}): DOMRect {
  return {
    x: rect.x ?? 0,
    y: rect.y ?? 0,
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    top: rect.top ?? 0,
    right: rect.right ?? 0,
    bottom: rect.bottom ?? 0,
    left: rect.left ?? 0,
    toJSON: () => ({}),
  } as DOMRect;
}

function createPointerEvent(
  type: string,
  init: EventInit & { clientX?: number; clientY?: number; pointerId?: number } = {},
): Event {
  const event = new Event(type, init);
  Object.defineProperties(event, {
    clientX: { configurable: true, value: init.clientX ?? 0 },
    clientY: { configurable: true, value: init.clientY ?? 0 },
    pointerId: { configurable: true, value: init.pointerId ?? 1 },
  });
  return event;
}

function setSliderClientSize(slider: HTMLDivElement, { width, height }: { width: number; height: number }) {
  Object.defineProperties(slider, {
    clientWidth: { configurable: true, value: width },
    clientHeight: { configurable: true, value: height },
  });
}

async function setSliderInputValue(input: HTMLInputElement, value: number) {
  input.value = `${value}`;
  Object.defineProperty(input, 'valueAsNumber', {
    configurable: true,
    value,
  });
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await nextTick();
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
    flush(timestamp: number) {
      const pendingCallbacks = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pendingCallbacks) {
        callback(timestamp);
      }
    },
  };
}

describe('Slider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('keeps the displayed percent bounded during delayed animation frames', async () => {
    const raf = mockAnimationFrame();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const currentValue = ref(0);
    const app = createApp({
      setup() {
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const slider = container.firstElementChild as HTMLDivElement | null;
    expect(slider).not.toBeNull();

    currentValue.value = 10;
    await nextTick();

    for (let index = 1; index <= 80; index += 1) {
      raf.flush(index * 50);
      await nextTick();

      const percent = Number(slider!.style.getPropertyValue('--percent'));
      expect(Number.isFinite(percent)).toBe(true);
      expect(percent).toBeGreaterThanOrEqual(0);
      expect(percent).toBeLessThanOrEqual(1);
    }

    expect(Number(slider!.style.getPropertyValue('--percent'))).toBeCloseTo(1, 3);

    app.unmount();
  });

  it('syncs the displayed percent immediately for direct input changes', async () => {
    const raf = mockAnimationFrame();
    const container = document.createElement('div');
    document.body.appendChild(container);

    const currentValue = ref(0);
    const app = createApp({
      setup() {
        return () =>
          h(Slider, {
            min: 0,
            max: 5000,
            step: 1,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const slider = container.firstElementChild as HTMLDivElement | null;
    const input = container.querySelector('input') as HTMLInputElement | null;
    expect(slider).not.toBeNull();
    expect(input).not.toBeNull();

    await setSliderInputValue(input!, 2500);

    expect(slider!.style.getPropertyValue('--percent')).toBe('0.5');

    raf.flush(16);
    await nextTick();

    expect(slider!.style.getPropertyValue('--percent')).toBe('0.5');

    app.unmount();
  });

  it('removes an open value indicator when the prop is disabled', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const currentValue = ref(2);
    const valueIndicator = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            valueIndicator: valueIndicator.value,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector('input');
    const handle = container.querySelector('[data-value-indicator-anchor="true"]');
    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(input).not.toBeNull();
    expect(handle).not.toBeNull();
    expect(indicator).not.toBeNull();

    Object.defineProperty(handle!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 120, bottom: 152, left: 220, right: 224, width: 4, height: 32 }),
    });
    Object.defineProperty(indicator!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 32 }),
    });

    input!.dispatchEvent(new Event('pointerenter', { bubbles: true }));
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    expect(indicator!.dataset.vttOpen).toBe('1');

    valueIndicator.value = false;
    await nextTick();

    expect(container.querySelector('[data-value-indicator="true"]')).toBeNull();
    expect(input!.getAttribute('aria-expanded')).toBeNull();

    app.unmount();
  });

  it('uses the shared tooltip popover implementation for the value indicator', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector('input');
    const handle = container.querySelector('[data-value-indicator-anchor="true"]');
    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(input).not.toBeNull();
    expect(handle).not.toBeNull();
    expect(indicator).not.toBeNull();
    expect(indicator?.getAttribute('role')).toBe('tooltip');
    expect(input?.getAttribute('aria-controls')).toBe(indicator?.id ?? null);

    Object.defineProperty(handle!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 120, bottom: 152, left: 220, right: 224, width: 4, height: 32 }),
    });
    Object.defineProperty(indicator!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 32 }),
    });

    input!.dispatchEvent(new Event('pointerenter', { bubbles: true }));
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    expect(indicator!.getAttribute('popover')).toBe('manual');
    expect(indicator!.classList.contains('vtt-popover')).toBe(true);
    expect(indicator!.dataset.vttFallback).toBe('1');
    expect(indicator!.dataset.vttOpen).toBe('1');
    expect(indicator!.style.left).toBe('198px');
    expect(indicator!.style.top).toBe('78px');
    expect(indicator!.style.getPropertyValue('translate')).toBe('0 calc(-1 * 0.25rem)');

    input!.dispatchEvent(new Event('pointerleave', { bubbles: true }));
    await nextTick();

    expect(indicator!.dataset.vttOpen).toBe('0');

    app.unmount();
  });

  it('hides the value indicator after dragging ends outside the slider', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector('input');
    const handle = container.querySelector('[data-value-indicator-anchor="true"]');
    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(input).not.toBeNull();
    expect(handle).not.toBeNull();
    expect(indicator).not.toBeNull();

    Object.defineProperty(input!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 100, right: 260, bottom: 140, left: 100, width: 160, height: 40 }),
    });
    Object.defineProperty(handle!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 104, bottom: 136, left: 176, right: 180, width: 4, height: 32 }),
    });
    Object.defineProperty(indicator!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 32 }),
    });

    input!.dispatchEvent(new Event('pointerenter', { bubbles: true }));
    input!.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, clientX: 180, clientY: 120 }));
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    expect(indicator!.dataset.vttOpen).toBe('1');

    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 320, clientY: 220 }));
    await nextTick();

    expect(indicator!.dataset.vttOpen).toBe('0');

    app.unmount();
  });

  it('hides the value indicator after dragging ends and the pointer leaves the slider', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector('input');
    const handle = container.querySelector('[data-value-indicator-anchor="true"]');
    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(input).not.toBeNull();
    expect(handle).not.toBeNull();
    expect(indicator).not.toBeNull();

    Object.defineProperty(input!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 100, right: 260, bottom: 140, left: 100, width: 160, height: 40 }),
    });
    Object.defineProperty(handle!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 104, bottom: 136, left: 176, right: 180, width: 4, height: 32 }),
    });
    Object.defineProperty(indicator!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 32 }),
    });

    input!.dispatchEvent(new Event('pointerenter', { bubbles: true }));
    input!.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, clientX: 180, clientY: 120 }));
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    expect(indicator!.dataset.vttOpen).toBe('1');

    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 180, clientY: 120 }));
    await nextTick();

    expect(indicator!.dataset.vttOpen).toBe('1');

    window.dispatchEvent(createPointerEvent('pointermove', { clientX: 320, clientY: 220 }));
    await nextTick();

    expect(indicator!.dataset.vttOpen).toBe('0');

    app.unmount();
  });

  it('does not keep the value indicator open from pointer-induced focus after dragging', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector('input');
    const handle = container.querySelector('[data-value-indicator-anchor="true"]');
    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(input).not.toBeNull();
    expect(handle).not.toBeNull();
    expect(indicator).not.toBeNull();

    let focusVisible = true;
    const originalMatches = input!.matches.bind(input!);
    Object.defineProperty(input!, 'matches', {
      configurable: true,
      value: (selector: string) => {
        if (selector === ':focus-visible') {
          return focusVisible;
        }
        return originalMatches(selector);
      },
    });

    Object.defineProperty(input!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 100, right: 260, bottom: 140, left: 100, width: 160, height: 40 }),
    });
    Object.defineProperty(handle!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 104, bottom: 136, left: 176, right: 180, width: 4, height: 32 }),
    });
    Object.defineProperty(indicator!, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 32 }),
    });

    input!.dispatchEvent(new Event('focus', { bubbles: true }));
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    expect(indicator!.dataset.vttOpen).toBe('1');

    focusVisible = false;
    input!.dispatchEvent(new Event('pointerenter', { bubbles: true }));
    input!.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, clientX: 180, clientY: 120 }));
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 180, clientY: 120 }));
    window.dispatchEvent(createPointerEvent('pointermove', { clientX: 320, clientY: 220 }));
    await nextTick();

    expect(indicator!.dataset.vttOpen).toBe('0');

    app.unmount();
  });

  it('defaults the vertical value indicator placement to end even in rtl', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            vertical: true,
            direction: 'rtl',
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(indicator).not.toBeNull();
    expect(indicator!.style.getPropertyValue('translate')).toBe('0.25rem 0');
    app.unmount();
  });

  it('marks the slider as value dragging only after pointer dragging starts', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const slider = container.firstElementChild as HTMLDivElement | null;
    const input = container.querySelector('input');

    expect(slider).not.toBeNull();
    expect(input).not.toBeNull();

    input!.dispatchEvent(
      createPointerEvent('pointerdown', { bubbles: true, clientX: 180, clientY: 120, pointerId: 7 }),
    );
    await nextTick();

    expect(slider!.classList.contains('m3-slider-value-dragging')).toBe(false);

    window.dispatchEvent(createPointerEvent('pointermove', { clientX: 186, clientY: 120, pointerId: 7 }));
    await nextTick();

    expect(slider!.classList.contains('m3-slider-value-dragging')).toBe(true);

    window.dispatchEvent(createPointerEvent('pointerup', { clientX: 186, clientY: 120, pointerId: 7 }));
    await nextTick();

    expect(slider!.classList.contains('m3-slider-value-dragging')).toBe(false);

    app.unmount();
  });

  it('offsets vertical start placement toward inline start', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            vertical: true,
            valueIndicatorPlacement: 'start',
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(indicator).not.toBeNull();
    expect(indicator!.style.getPropertyValue('translate')).toBe('calc(-1 * 0.25rem) 0');

    app.unmount();
  });

  it('only renders inset icons for medium and larger sliders', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            size: 'small',
            startIcon: 'radio_button_unchecked',
            endIcon: 'square',
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    expect(container.querySelector('[data-inset-icon="start"]')).toBeNull();
    expect(container.querySelector('[data-inset-icon="end"]')).toBeNull();

    app.unmount();
  });

  it('moves the start inset icon to the opposite side when the active segment is too short', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(2);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            startIcon: 'radio_button_unchecked',
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);

    const slider = container.firstElementChild as HTMLDivElement | null;
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(slider).not.toBeNull();
    expect(input).not.toBeNull();

    setSliderClientSize(slider!, { width: 120, height: 52 });
    await setSliderInputValue(input!, 3);

    const startInsetIcon = container.querySelector('[data-inset-icon="start"]') as HTMLElement | null;
    expect(startInsetIcon).not.toBeNull();
    expect(startInsetIcon!.classList.contains('m3-slider-inset-icon-flipped')).toBe(true);
    expect(startInsetIcon!.classList.contains('m3-slider-inset-icon-on-inactive')).toBe(true);

    app.unmount();
  });

  it('moves the end inset icon to the active side when the inactive segment is too short', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const currentValue = ref(6);
        return () =>
          h(Slider, {
            min: 0,
            max: 10,
            step: 1,
            endIcon: 'square',
            value: currentValue.value,
            'onUpdate:value': (nextValue: number) => {
              currentValue.value = nextValue;
            },
          });
      },
    });

    app.mount(container);

    const slider = container.firstElementChild as HTMLDivElement | null;
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(slider).not.toBeNull();
    expect(input).not.toBeNull();

    setSliderClientSize(slider!, { width: 120, height: 52 });
    await setSliderInputValue(input!, 7);

    const endInsetIcon = container.querySelector('[data-inset-icon="end"]') as HTMLElement | null;
    expect(endInsetIcon).not.toBeNull();
    expect(endInsetIcon!.classList.contains('m3-slider-inset-icon-flipped')).toBe(true);
    expect(endInsetIcon!.classList.contains('m3-slider-inset-icon-on-active')).toBe(true);

    app.unmount();
  });
});
