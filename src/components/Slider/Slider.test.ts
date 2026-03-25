// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
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

function createPointerEvent(type: string, init: EventInit & { clientX?: number; clientY?: number } = {}): Event {
  const event = new Event(type, init);
  Object.defineProperties(event, {
    clientX: { configurable: true, value: init.clientX ?? 0 },
    clientY: { configurable: true, value: init.clientY ?? 0 },
  });
  return event;
}

describe('Slider', () => {
  afterEach(() => {
    document.body.innerHTML = '';
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
    input!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
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
    input!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
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
    input!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
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

    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(indicator).not.toBeNull();
    expect(indicator!.style.getPropertyValue('translate')).toBe('0.25rem 0');
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

    const indicator = container.querySelector('[data-value-indicator="true"]') as HTMLDivElement | null;

    expect(indicator).not.toBeNull();
    expect(indicator!.style.getPropertyValue('translate')).toBe('calc(-1 * 0.25rem) 0');

    app.unmount();
  });

});
