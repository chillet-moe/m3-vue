// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import Icon from '@/components/Icon/Icon.vue';
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
  it('uses the same icon layout wrappers for props and custom slots', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        h(
          Button,
          { leadingIcon: 'search', trailingIcon: 'close' },
          {
            default: () => 'Prop icons',
          },
        ),
        h(
          Button,
          {},
          {
            leading: () => h(Icon, { name: 'search' }),
            default: () => 'Slot icons',
            trailing: () => h(Icon, { name: 'close' }),
          },
        ),
      ]),
    );

    app.mount(container);
    await nextTick();

    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.m3-button'));

    for (const button of buttons) {
      const leading = button.querySelector<HTMLElement>('.m3-button-leading.m3-button-icon');
      const trailing = button.querySelector<HTMLElement>('.m3-button-trailing.m3-button-icon');

      expect(leading?.dataset.part).toBe('leading');
      expect(leading?.querySelector('.m3-icon')).not.toBeNull();
      expect(trailing?.dataset.part).toBe('trailing');
      expect(trailing?.querySelector('.m3-icon')).not.toBeNull();
    }

    app.unmount();
  });

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
    expect(button?.hasAttribute('title')).toBe(false);
    expect(button?.getAttribute('data-m3-action-title-tooltip')).toBe('Save changes');
    expect(button?.hasAttribute('aria-controls')).toBe(false);
    expect(button?.hasAttribute('aria-haspopup')).toBe(false);
    expect(document.body.querySelector('.m3-tooltip')).toBeNull();

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

    const button = container.querySelector('button');
    expect(button?.getAttribute('data-m3-action-title-tooltip')).toBe('Save changes');
    expect(document.body.querySelector('.m3-tooltip')).toBeNull();

    title.value = 'Discard changes';
    await nextTick();

    expect(button?.getAttribute('data-m3-action-title-tooltip')).toBe('Discard changes');
    expect(document.body.querySelector('.m3-tooltip')).toBeNull();

    title.value = '';
    await nextTick();

    expect(button?.hasAttribute('data-m3-action-title-tooltip')).toBe(false);
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
