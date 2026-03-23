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
    expect(indicator!.style.transform).toContain('translateY');
    expect(indicator!.style.transform).toContain('--offset');

    input!.dispatchEvent(new Event('pointerleave', { bubbles: true }));
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
    expect(indicator!.style.transform).toContain('translateX');
    expect(indicator!.style.transform).toContain('var(--offset)');
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
    expect(indicator!.style.transform).toContain('translateX');
    expect(indicator!.style.transform).toContain('calc(-1 * var(--offset))');

    app.unmount();
  });
});
