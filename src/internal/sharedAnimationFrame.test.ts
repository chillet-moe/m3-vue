// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerSharedAnimationFrame } from './sharedAnimationFrame';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shared animation frame runtime', () => {
  it('uses one browser frame for multiple active controllers and resets elapsed on restart', () => {
    let requestId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const id = ++requestId;
      callbacks.set(id, callback);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      callbacks.delete(id);
    });
    const firstFrames: number[] = [];
    const secondFrames: number[] = [];
    const first = registerSharedAnimationFrame(document, (elapsed) => firstFrames.push(elapsed));
    const second = registerSharedAnimationFrame(document, (elapsed) => secondFrames.push(elapsed));

    first.start();
    second.start();
    expect(callbacks.size).toBe(1);

    const flush = (timestamp: number) => {
      const current = [...callbacks.values()];
      callbacks.clear();
      current.forEach((callback) => callback(timestamp));
    };

    flush(100);
    flush(116);
    expect(firstFrames).toEqual([0, 16]);
    expect(secondFrames).toEqual([0, 16]);
    expect(callbacks.size).toBe(1);

    first.stop();
    flush(132);
    expect(firstFrames).toEqual([0, 16]);
    expect(secondFrames).toEqual([0, 16, 32]);

    second.stop();
    expect(callbacks.size).toBe(0);
    first.start();
    flush(500);
    expect(firstFrames).toEqual([0, 16, 0]);

    first.cleanup();
    second.cleanup();
    expect(callbacks.size).toBe(0);
  });
});
