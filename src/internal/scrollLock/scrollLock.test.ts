// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { lockPageScroll } from './scrollLock';

afterEach(() => {
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
  document.body.removeAttribute('data-m3-scroll-lock');
  vi.restoreAllMocks();
});

describe('lockPageScroll', () => {
  it('locks body scroll and restores previous inline styles', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '4px';

    const unlock = lockPageScroll();

    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('calc(28px)');
    expect(document.documentElement.style.getPropertyValue('--scrollbar-width')).toBe('24px');

    unlock();

    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('4px');
    expect(document.documentElement.style.getPropertyValue('--scrollbar-width')).toBe('');
  });

  it('compensates a left-side scrollbar in RTL layouts', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 24,
      right: 0,
      top: 0,
      width: 0,
      x: 24,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.style.paddingLeft = '6px';

    const unlock = lockPageScroll();

    expect(document.body.style.paddingLeft).toBe('calc(30px)');
    expect(document.body.style.paddingRight).toBe('');

    unlock();

    expect(document.body.style.paddingLeft).toBe('6px');
  });

  it('keeps styles locked until all locks are released', () => {
    const unlockFirst = lockPageScroll();
    const unlockSecond = lockPageScroll();

    unlockFirst();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(true);

    unlockSecond();

    expect(document.body.style.overflow).toBe('');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(false);
  });

  it('ignores duplicate release calls', () => {
    const unlock = lockPageScroll();

    unlock();
    unlock();

    expect(document.body.style.overflow).toBe('');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(false);
  });

  it('uses fixed body positioning on iOS and restores scroll position', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('iPhone');
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(window, 'scrollX', 'get').mockReturnValue(12);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(34);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const unlock = lockPageScroll();

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-34px');
    expect(document.body.style.left).toBe('-12px');
    expect(document.body.style.right).toBe('0px');

    unlock();

    expect(document.body.style.position).toBe('');
    expect(scrollTo).toHaveBeenCalledWith(12, 34);
  });
});
