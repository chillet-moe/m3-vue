// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import Button from './Button.vue';

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

describe('Button', () => {
  it('clears the pressed state when the pointer is released outside the button', async () => {
    vi.useFakeTimers();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(Button, undefined, {
          default: () => 'Button',
        });
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button).not.toBeNull();

    button?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, pointerId: 7 }));
    await nextTick();

    expect(button?.dataset.pressed).toBe('true');

    window.dispatchEvent(createPointerEvent('pointerup', { pointerId: 7 }));
    await vi.advanceTimersByTimeAsync(250);
    await nextTick();

    expect(button?.dataset.pressed).toBe('false');

    app.unmount();
  });

  it('keeps pressed state disabled when click morphing is turned off', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(
          Button,
          {
            pressShapeMorph: false,
          },
          {
            default: () => 'Button',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button).not.toBeNull();
    expect(button?.dataset.pressShapeMorph).toBe('false');

    button?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, pointerId: 9 }));
    await nextTick();

    expect(button?.dataset.pressed).toBe('false');

    app.unmount();
  });

  it('blocks click listeners on disabled anchor buttons', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let clickCount = 0;

    const app = createApp({
      render() {
        return h(
          Button,
          {
            href: '/blocked',
            disabled: true,
            onClick: () => {
              clickCount += 1;
            },
          },
          {
            default: () => 'Button',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('a') as HTMLAnchorElement | null;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

    const dispatched = button?.dispatchEvent(clickEvent);

    expect(button?.getAttribute('href')).toBeNull();
    expect(dispatched).toBe(false);
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(clickCount).toBe(0);

    app.unmount();
  });

  it('uses title as a component tooltip instead of a native tooltip', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(
          Button,
          {
            title: 'Save changes',
          },
          {
            default: () => 'Save',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;
    const tooltip = document.body.querySelector<HTMLElement>('.m3-tooltip');

    expect(button?.hasAttribute('title')).toBe(false);
    expect(button?.getAttribute('aria-controls')).toBe(tooltip?.id);
    expect(button?.getAttribute('aria-haspopup')).toBe('true');
    expect(tooltip?.textContent).toBe('Save changes');
    expect(tooltip?.getAttribute('role')).toBe('tooltip');

    app.unmount();
  });

  it('updates the component tooltip when title changes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const title = ref('Save changes');

    const app = createApp({
      setup() {
        return () =>
          h(
            Button,
            {
              title: title.value,
            },
            {
              default: () => 'Save',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    let tooltip = document.body.querySelector<HTMLElement>('.m3-tooltip');
    expect(tooltip?.textContent).toBe('Save changes');

    title.value = 'Discard changes';
    await nextTick();

    tooltip = document.body.querySelector<HTMLElement>('.m3-tooltip');
    expect(tooltip?.textContent).toBe('Discard changes');

    title.value = '';
    await nextTick();

    expect(document.body.querySelector('.m3-tooltip')).toBeNull();

    app.unmount();
  });

  it('does not install a title tooltip when title is absent', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(Button, undefined, {
          default: () => 'Button',
        });
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button?.hasAttribute('aria-controls')).toBe(false);
    expect(button?.hasAttribute('aria-haspopup')).toBe(false);
    expect(document.body.querySelector('.m3-tooltip')).toBeNull();

    app.unmount();
  });
});
