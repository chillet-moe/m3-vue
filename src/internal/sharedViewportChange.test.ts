// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerSharedViewportChange } from './sharedViewportChange';

describe('shared viewport change runtime', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shares viewport listeners and coalesces callbacks into one frame', () => {
    const frames: FrameRequestCallback[] = [];
    const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const removeFirst = registerSharedViewportChange(document, firstCallback);
    const removeSecond = registerSharedViewportChange(document, secondCallback);

    expect(addEventListener.mock.calls.filter(([type]) => type === 'scroll' || type === 'resize')).toHaveLength(2);

    const scroller = document.createElement('div');
    document.body.append(scroller);
    scroller.dispatchEvent(new Event('scroll')); // Element scroll events do not bubble.
    scroller.remove();
    window.dispatchEvent(new Event('resize'));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).not.toHaveBeenCalled();

    frames[0]!(0);
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);

    removeFirst();
    expect(removeEventListener).not.toHaveBeenCalled();
    removeSecond();
    expect(removeEventListener.mock.calls.filter(([type]) => type === 'scroll' || type === 'resize')).toHaveLength(2);
    expect(cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it('cancels a pending frame when the last callback unregisters', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(7);
    const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
    const remove = registerSharedViewportChange(document, () => {});

    window.dispatchEvent(new Event('scroll'));
    remove();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
  });
});
