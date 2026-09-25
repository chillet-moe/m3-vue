// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { useAnimatedNumber, type UseAnimatedNumberReturn } from './useAnimatedNumber';

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

describe('useAnimatedNumber', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('animates toward target changes on the first animation frame', async () => {
    const raf = mockAnimationFrame();
    const target = ref(0);
    let animated!: UseAnimatedNumberReturn;
    const app = createApp({
      setup() {
        animated = useAnimatedNumber(target, {
          clamp: (value) => Math.min(Math.max(value, 0), 1),
        });

        return () => h('div');
      },
    });

    app.mount(document.createElement('div'));

    target.value = 1;
    await nextTick();

    expect(animated.displayedValue.value).toBe(0);

    raf.flush(16);
    await nextTick();

    expect(animated.displayedValue.value).toBeGreaterThan(0);
    expect(animated.displayedValue.value).toBeLessThan(1);

    app.unmount();
  });

  it('can sync to the target immediately and cancel pending animation', async () => {
    const raf = mockAnimationFrame();
    const target = ref(0);
    let animated!: UseAnimatedNumberReturn;
    const app = createApp({
      setup() {
        animated = useAnimatedNumber(target, {
          clamp: (value) => Math.min(Math.max(value, 0), 1),
        });

        return () => h('div');
      },
    });

    app.mount(document.createElement('div'));

    target.value = 1;
    animated.syncToTarget();
    await nextTick();

    expect(animated.displayedValue.value).toBe(1);

    raf.flush(16);
    await nextTick();

    expect(animated.displayedValue.value).toBe(1);

    app.unmount();
  });
});
