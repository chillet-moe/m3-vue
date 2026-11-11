// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import { usePressedState } from './pressedState';

function pointer(target: EventTarget, type: string, pointerId: number) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  target.dispatchEvent(event);
}

function mountTarget() {
  const container = document.createElement('div');
  document.body.append(container);
  const app = createApp({
    setup() {
      const press = usePressedState(100);
      return () =>
        h('button', {
          'data-pressed': String(press.pressed.value),
          onPointerdown: press.onPointerDown,
          onPointerup: press.onPointerUp,
          onPointercancel: press.onPointerCancel,
        });
    },
  });
  app.mount(container);
  return { app, button: container.querySelector('button')! };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe('usePressedState', () => {
  it('keeps a short press visible and waits for the active pointer on a long press', async () => {
    vi.useFakeTimers();
    const { app, button } = mountTarget();

    pointer(button, 'pointerdown', 1);
    pointer(window, 'pointerup', 1);
    await vi.advanceTimersByTimeAsync(99);
    expect(button.dataset.pressed).toBe('true');
    await vi.advanceTimersByTimeAsync(1);
    expect(button.dataset.pressed).toBe('false');

    pointer(button, 'pointerdown', 2);
    pointer(button, 'pointerdown', 3);
    pointer(window, 'pointercancel', 3);
    await vi.advanceTimersByTimeAsync(100);
    expect(button.dataset.pressed).toBe('true');
    pointer(window, 'pointercancel', 2);
    await nextTick();
    expect(button.dataset.pressed).toBe('false');

    app.unmount();
  });

  it('cancels a press on document adoption and accepts a new press in the destination', async () => {
    const { app, button } = mountTarget();
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const destination = frame.contentWindow!;

    pointer(button, 'pointerdown', 1);
    await nextTick();
    expect(button.dataset.pressed).toBe('true');

    destination.document.body.append(button);
    await Promise.resolve();
    await nextTick();
    expect(button.dataset.pressed).toBe('false');

    pointer(button, 'pointerdown', 2);
    await nextTick();
    expect(button.dataset.pressed).toBe('true');
    destination.dispatchEvent(new Event('pagehide'));
    await nextTick();
    expect(button.dataset.pressed).toBe('false');

    app.unmount();
  });
});
