// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import vTooltip, { normalizeBinding } from './vTooltip';
import { positionFallback, resolveFallbackPlacement } from './helpers';

function createTrigger() {
  const el = document.createElement('button');
  document.body.appendChild(el);
  return el;
}

function createRect(rect: Partial<DOMRect> = {}): DOMRect {
  return {
    x: rect.x ?? 0,
    y: rect.y ?? 0,
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    top: rect.top ?? 0,
    right: rect.right ?? 0,
    bottom: rect.bottom ?? 0,
    left: rect.left ?? 0,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('normalizeBinding', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('treats plain strings as content', () => {
    expect(normalizeBinding('Hello')).toMatchObject({ content: 'Hello', placement: 'top', interactive: true });
  });

  it('treats matching selectors as targets', () => {
    const tip = document.createElement('div');
    tip.id = 'tip';
    document.body.appendChild(tip);

    expect(normalizeBinding('#tip')).toMatchObject({ target: '#tip' });
  });
});

describe('vTooltip directive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('creates and cleans up a generated tooltip element', () => {
    const el = createTrigger();

    vTooltip.mounted?.(el, { value: 'Tooltip content' } as never);

    const tip = document.body.querySelector('.vtt-popover');
    expect(tip).not.toBeNull();
    expect(el.getAttribute('aria-controls')).toBe(tip?.id);

    vTooltip.unmounted?.(el);

    expect(document.body.querySelector('.vtt-popover')).toBeNull();
    expect(el.hasAttribute('aria-controls')).toBe(false);
  });

  it('rebuilds generated tooltip content on update', () => {
    const el = createTrigger();

    vTooltip.mounted?.(el, { value: 'Old content' } as never);
    let tip = document.body.querySelector('.vtt-popover');
    expect(tip?.textContent).toBe('Old content');

    vTooltip.updated?.(el, { value: 'New content', oldValue: 'Old content' } as never);
    tip = document.body.querySelector('.vtt-popover');

    expect(tip?.textContent).toBe('New content');
  });
});

describe('positionFallback', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves start and end against horizontal direction', () => {
    const anchor = document.createElement('div');
    anchor.style.direction = 'rtl';

    expect(resolveFallbackPlacement(anchor, 'start')).toBe('right');
    expect(resolveFallbackPlacement(anchor, 'end')).toBe('left');
  });

  it('resolves logical placements against vertical writing mode', () => {
    const anchor = document.createElement('div');
    const tip = document.createElement('div');

    anchor.style.writingMode = 'vertical-rl';

    Object.defineProperty(anchor, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 40, bottom: 72, left: 160, right: 192, width: 32, height: 32 }),
    });
    Object.defineProperty(tip, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 24 }),
    });

    expect(resolveFallbackPlacement(anchor, 'top')).toBe('right');
    expect(resolveFallbackPlacement(anchor, 'bottom')).toBe('left');
    expect(resolveFallbackPlacement(anchor, 'start')).toBe('top');
    expect(resolveFallbackPlacement(anchor, 'end')).toBe('bottom');

    positionFallback(tip, anchor, 'end');

    expect(tip.style.left).toBe('152px');
    expect(tip.style.top).toBe('82px');
  });
});