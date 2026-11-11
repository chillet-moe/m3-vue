// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, reactive, ref } from 'vue';
import { usePressShapeMorph } from './usePressShapeMorph';

function createPointerEvent(type: string, init: EventInit & { pointerId?: number } = {}): Event {
  const event = new Event(type, init);
  Object.defineProperty(event, 'pointerId', {
    configurable: true,
    value: init.pointerId ?? 1,
  });
  return event;
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('usePressShapeMorph', () => {
  it('supports direct press handlers without delegated attributes', async () => {
    vi.useFakeTimers();
    const container = document.createElement('div');
    document.body.append(container);

    const app = createApp({
      setup() {
        const { pressed, onPointerDown } = usePressShapeMorph({ minDuration: 50 });
        return () => h('button', { 'data-pressed': String(pressed.value), onPointerdown: onPointerDown });
      },
    });
    app.mount(container);
    const button = container.querySelector('button')!;

    button.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(button.dataset.pressed).toBe('true');
    window.dispatchEvent(createPointerEvent('pointerup'));
    await vi.advanceTimersByTimeAsync(50);
    expect(button.dataset.pressed).toBe('false');

    app.unmount();
  });

  it('provides reusable press morph attrs for arbitrary elements', async () => {
    vi.useFakeTimers();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const { pressShapeMorphAttrs } = usePressShapeMorph();

        return () => h('div', { ...pressShapeMorphAttrs.value }, 'Pressable');
      },
    });

    app.mount(container);
    await nextTick();

    const element = container.querySelector('div div') as HTMLElement | null;

    expect(element).not.toBeNull();
    expect(element?.dataset.pressed).toBe('false');

    element?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, pointerId: 7 }));
    await nextTick();

    expect(element?.dataset.pressed).toBe('true');

    window.dispatchEvent(createPointerEvent('pointerup', { pointerId: 7 }));
    await vi.advanceTimersByTimeAsync(250);
    await nextTick();

    expect(element?.dataset.pressed).toBe('false');

    app.unmount();
  });

  it('blocks disabled click handlers merged on the same target', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let clickCount = 0;

    const app = createApp({
      setup() {
        const { pressShapeMorphAttrs } = usePressShapeMorph({ disabled: true });

        return () => {
          const attrs = pressShapeMorphAttrs.value;

          return h(
            'a',
            {
              ...attrs,
              href: '/blocked',
              onClick: () => {
                clickCount += 1;
              },
            },
            'Disabled link',
          );
        };
      },
    });

    app.mount(container);
    await nextTick();

    const link = container.querySelector('a') as HTMLAnchorElement | null;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

    const dispatched = link?.dispatchEvent(clickEvent);

    expect(dispatched).toBe(false);
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(clickCount).toBe(0);

    app.unmount();
  });

  it('uses duration changes before release and preserves the scheduled release afterward', async () => {
    vi.useFakeTimers();
    const clock = vi.spyOn(window.performance, 'now').mockReturnValue(0);
    const container = document.createElement('div');
    document.body.append(container);
    const options = reactive({ minDuration: 100 });
    const app = createApp({
      setup() {
        const { pressShapeMorphAttrs } = usePressShapeMorph(options);
        return () => h('button', pressShapeMorphAttrs.value, String(options.minDuration));
      },
    });
    app.mount(container);
    const button = container.querySelector('button')!;

    try {
      button.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true }));
      expect(button.dataset.pressed).toBe('true');

      options.minDuration = 150;
      await nextTick();
      window.dispatchEvent(createPointerEvent('pointerup'));

      options.minDuration = 300;
      await nextTick();
      await vi.advanceTimersByTimeAsync(149);
      expect(button.dataset.pressed).toBe('true');
      await vi.advanceTimersByTimeAsync(1);
      expect(button.dataset.pressed).toBe('false');
    } finally {
      app.unmount();
      clock.mockRestore();
    }
  });

  it('finishes an active press even if the element becomes disabled before pointerup', async () => {
    vi.useFakeTimers();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const disabled = ref(false);

    const app = createApp({
      setup() {
        const { pressShapeMorphAttrs } = usePressShapeMorph({ disabled });

        return () => h('button', { ...pressShapeMorphAttrs.value }, 'Pressable');
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;

    button?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, pointerId: 9 }));
    await nextTick();

    expect(button?.dataset.pressed).toBe('true');

    disabled.value = true;
    await nextTick();

    expect(button?.dataset.pressed).toBe('false');

    button?.dispatchEvent(createPointerEvent('pointerup', { bubbles: true, pointerId: 9 }));
    await vi.advanceTimersByTimeAsync(250);

    disabled.value = false;
    await nextTick();

    expect(button?.dataset.pressed).toBe('false');

    app.unmount();
  });

  it('shares delegated DOM listeners across many mounted instances', async () => {
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const instances = Array.from({ length: 100 }, () => usePressShapeMorph());
        return () =>
          h(
            'div',
            instances.map(({ pressShapeMorphAttrs }, index) =>
              h('button', {
                ...pressShapeMorphAttrs.value,
                key: index,
              }),
            ),
          );
      },
    });

    app.mount(container);
    await nextTick();

    expect(addEventListener.mock.calls.filter(([type]) => type === 'pointerdown')).toHaveLength(1);
    expect(addEventListener.mock.calls.filter(([type]) => type === 'pointerup')).toHaveLength(1);
    expect(addEventListener.mock.calls.filter(([type]) => type === 'pointercancel')).toHaveLength(1);
    expect(addEventListener.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1);

    app.unmount();
  });
});
