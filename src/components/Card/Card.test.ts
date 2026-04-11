// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import Card from './Card.vue';

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

describe('Card', () => {
  it('clears the pressed state when the pointer is released outside the card', async () => {
    vi.useFakeTimers();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(
          Card,
          {
            clickable: true,
          },
          {
            default: () => 'Card',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const card = container.querySelector('button') as HTMLButtonElement | null;

    expect(card).not.toBeNull();

    card?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, pointerId: 7 }));
    await nextTick();

    expect(card?.dataset.pressed).toBe('true');

    window.dispatchEvent(createPointerEvent('pointerup', { pointerId: 7 }));
    await vi.advanceTimersByTimeAsync(250);
    await nextTick();

    expect(card?.dataset.pressed).toBe('false');

    app.unmount();
  });
});
