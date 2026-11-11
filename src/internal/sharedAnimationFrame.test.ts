// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerSharedAnimationFrame } from './sharedAnimationFrame';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
    const secondFrames: [number, boolean][] = [];
    const first = registerSharedAnimationFrame(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      (elapsed) => firstFrames.push(elapsed),
    );
    const second = registerSharedAnimationFrame(
      document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      (elapsed, hasPeers) => secondFrames.push([elapsed, hasPeers]),
    );

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
    expect(secondFrames).toEqual([
      [0, true],
      [16, true],
    ]);
    expect(callbacks.size).toBe(1);

    first.stop();
    flush(132);
    expect(firstFrames).toEqual([0, 16]);
    expect(secondFrames).toEqual([
      [0, true],
      [16, true],
      [32, false],
    ]);

    second.stop();
    expect(callbacks.size).toBe(0);
    first.start();
    flush(500);
    expect(firstFrames).toEqual([0, 16, 0]);

    first.cleanup();
    second.cleanup();
    expect(callbacks.size).toBe(0);
  });

  it('draws the reveal phase before publishing newly measured geometry', () => {
    let pending: FrameRequestCallback | undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      pending = callback;
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      pending = undefined;
    });

    let notify!: ResizeObserverCallback;
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          notify = callback;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = disconnect;
      },
    );
    let timestamp = 100;
    Object.defineProperty(document, 'timeline', {
      configurable: true,
      value: {
        get currentTime() {
          return timestamp;
        },
      },
    });

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const root = document.createElement('div');
    root.append(svg);
    const frames: [elapsed: number, width: number][] = [];
    let pendingWidth = 0;
    let measuredWidth = 0;
    const controller = registerSharedAnimationFrame(svg, (elapsed) => frames.push([elapsed, measuredWidth]), {
      element: root,
      measure: () => {
        measuredWidth = pendingWidth;
      },
    });
    const resize = (width: number) => {
      pendingWidth = width;
      const size = [{ inlineSize: width, blockSize: width }];
      notify(
        [root, svg].map((target) => ({
          target,
          contentRect: new DOMRect(0, 0, width, width),
          borderBoxSize: size,
          contentBoxSize: size,
          devicePixelContentBoxSize: size,
        })),
        {} as ResizeObserver,
      );
    };
    const flush = () => {
      const callback = pending;
      pending = undefined;
      callback?.(timestamp);
    };

    try {
      expect(observe).toHaveBeenCalledWith(root);
      controller.start();
      expect(observe).toHaveBeenCalledWith(svg);
      resize(0);
      flush();
      expect(frames).toEqual([]);
      expect(pending).toBeUndefined();

      timestamp = 320;
      resize(40);
      expect(frames).toEqual([[220, 0]]);
      timestamp = 336;
      flush();
      expect(frames).toEqual([
        [220, 0],
        [236, 40],
      ]);

      resize(0);
      expect(pending).toBeUndefined();
      controller.stop();
      expect(unobserve).toHaveBeenCalledWith(svg);
      timestamp = 500;
      resize(50);
      expect(frames).toHaveLength(2);

      controller.start();
      flush();
      expect(frames[2]).toEqual([0, 50]);
    } finally {
      controller.cleanup();
      Reflect.deleteProperty(document, 'timeline');
    }
    expect(unobserve).toHaveBeenCalledWith(root);
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
