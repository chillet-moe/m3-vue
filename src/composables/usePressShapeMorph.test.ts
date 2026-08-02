// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
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
