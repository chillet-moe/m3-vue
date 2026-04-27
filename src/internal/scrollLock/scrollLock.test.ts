// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { lockPageScroll } from './scrollLock';

afterEach(() => {
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});

describe('lockPageScroll', () => {
  it('locks and restores document scroll styles', () => {
    document.body.style.overflow = 'auto';
    document.body.style.overscrollBehavior = 'contain';
    document.documentElement.style.overflow = 'auto';

    const unlock = lockPageScroll();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.overscrollBehavior).toBe('none');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overscrollBehavior).toBe('none');
    expect(document.documentElement.style.scrollbarGutter).toBe('stable');

    unlock();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.overscrollBehavior).toBe('contain');
    expect(document.body.style.position).toBe('');
    expect(document.body.style.width).toBe('');
    expect(document.documentElement.style.overflow).toBe('auto');
    expect(document.documentElement.style.overscrollBehavior).toBe('');
    expect(document.documentElement.style.scrollbarGutter).toBe('');
  });

  it('does not compensate scrollbar removal by changing the body content box', () => {
    document.body.style.paddingInlineEnd = '4px';
    document.body.style.boxSizing = 'content-box';

    const unlock = lockPageScroll();

    expect(document.body.style.paddingInlineEnd).toBe('4px');
    expect(document.body.style.boxSizing).toBe('content-box');
    expect(document.documentElement.style.scrollbarGutter).toBe('stable');

    unlock();

    expect(document.body.style.paddingInlineEnd).toBe('4px');
    expect(document.body.style.boxSizing).toBe('content-box');
    expect(document.documentElement.style.scrollbarGutter).toBe('');
  });

  it('keeps styles locked until all locks are released', () => {
    const unlockFirst = lockPageScroll();
    const unlockSecond = lockPageScroll();

    unlockFirst();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    unlockSecond();

    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('ignores duplicate release calls', () => {
    const unlock = lockPageScroll();

    unlock();
    unlock();

    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });
});
