// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import vTooltip, { normalizeBinding } from './vTooltip';
import { inferPlacementFromRects, placementToTranslate, positionFallback, resolveFallbackPlacement } from './helpers';
import { setupTooltip } from './setup';

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

  it('treats plain strings as targets', () => {
    expect(normalizeBinding('Hello')).toMatchObject({
      target: 'Hello',
      placement: 'top',
      interactive: true,
      popoverType: 'hint',
    });
  });

  it('treats selector strings as targets without resolving them eagerly', () => {
    expect(normalizeBinding('#tip')).toMatchObject({ target: '#tip' });
  });

  it('normalizes offset from config bindings', () => {
    expect(normalizeBinding({ content: 'Hello', offset: '1rem' })).toMatchObject({ content: 'Hello', offset: '1rem' });
  });

  it('uses 0.25rem as the default offset', () => {
    expect(normalizeBinding({ content: 'Hello' })).toMatchObject({ offset: '0.25rem' });
  });
});

describe('vTooltip directive', () => {
  let requestAnimationFrameSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    requestAnimationFrameSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('creates and cleans up a generated tooltip element', () => {
    const el = createTrigger();

    vTooltip.mounted?.(el, { value: { content: 'Tooltip content' } } as never);

    const tip = document.body.querySelector('.vtt-popover');
    expect(tip).not.toBeNull();
    expect(el.getAttribute('aria-controls')).toBe(tip?.id);

    vTooltip.unmounted?.(el);

    expect(document.body.querySelector('.vtt-popover')).toBeNull();
    expect(el.hasAttribute('aria-controls')).toBe(false);
  });

  it('rebuilds generated tooltip content on update', () => {
    const el = createTrigger();

    vTooltip.mounted?.(el, { value: { content: 'Old content' } } as never);
    let tip = document.body.querySelector('.vtt-popover');
    expect(tip?.textContent).toBe('Old content');

    vTooltip.updated?.(el, {
      value: { content: 'New content' },
      oldValue: { content: 'Old content' },
    } as never);
    tip = document.body.querySelector('.vtt-popover');

    expect(tip?.textContent).toBe('New content');
  });

  it('updates generated tooltip content without rebuilding the element', () => {
    const el = createTrigger();
    const state = setupTooltip(el, { content: 'Old content' }, { manual: true });
    const tip = state.tip;

    state.update({ content: 'New content' });

    expect(state.tip).toBe(tip);
    expect(tip.textContent).toBe('New content');

    state.cleanup();
  });

  it('applies placement-based offset as translate during idle time while closed', () => {
    const el = createTrigger();

    vTooltip.mounted?.(el, {
      value: {
        content: 'Tooltip content',
        placement: 'end',
        offset: 'var(--space)',
      },
    } as never);

    const tip = document.body.querySelector('.vtt-popover') as HTMLElement | null;

    expect(tip).not.toBeNull();
    expect(tip!.style.getPropertyValue('translate')).toBe('');

    vi.runOnlyPendingTimers();

    expect(tip!.style.getPropertyValue('translate')).toBe('var(--space) 0');
  });

  it('does not resolve fallback placement while the tooltip is closed', () => {
    const el = createTrigger();
    const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle');
    const state = setupTooltip(el, {
      content: 'Tooltip content',
      placement: 'end',
      offset: 'var(--space)',
    }, { manual: true });

    expect(getComputedStyleSpy).not.toHaveBeenCalled();
    vi.runOnlyPendingTimers();
    expect(getComputedStyleSpy).not.toHaveBeenCalled();

    state.cleanup();
    getComputedStyleSpy.mockRestore();
  });

  it('skips semantically identical updates', () => {
    const el = createTrigger();
    const state = setupTooltip(el, {
      content: 'Tooltip content',
      placement: 'top',
    }, { manual: true });
    const setAttributeSpy = vi.spyOn(state.tip, 'setAttribute');

    state.update({
      content: 'Tooltip content',
      placement: 'top',
    });

    expect(setAttributeSpy).not.toHaveBeenCalled();

    setAttributeSpy.mockRestore();
    state.cleanup();
  });

  it('updates offset to match the flipped fallback placement', () => {
    const el = createTrigger();
    const state = setupTooltip(el, {
      content: 'Tooltip content',
      placement: 'top',
      offset: 'var(--space)',
    }, { manual: true });

    Object.defineProperty(el, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 4, bottom: 36, left: 120, right: 152, width: 32, height: 32 }),
    });
    Object.defineProperty(state.tip, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 24 }),
    });

    state.show();

    expect(state.tip.style.getPropertyValue('translate')).toBe('0 var(--space)');

    state.cleanup();
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

  it('returns the flipped placement when space is insufficient', () => {
    const anchor = document.createElement('div');
    const tip = document.createElement('div');

    Object.defineProperty(anchor, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ top: 4, bottom: 36, left: 120, right: 152, width: 32, height: 32 }),
    });
    Object.defineProperty(tip, 'getBoundingClientRect', {
      configurable: true,
      value: () => createRect({ width: 48, height: 24 }),
    });

    expect(positionFallback(tip, anchor, 'top')).toBe('bottom');
    expect(tip.style.left).toBe('112px');
    expect(tip.style.top).toBe('46px');
  });
});

describe('inferPlacementFromRects', () => {
  it('infers the rendered side from actual geometry', () => {
    const anchorRect = createRect({ top: 40, bottom: 72, left: 100, right: 132, width: 32, height: 32 });
    const tipRect = createRect({ top: 82, bottom: 106, left: 92, right: 140, width: 48, height: 24 });

    expect(inferPlacementFromRects(tipRect, anchorRect, 'top')).toBe('bottom');
  });

  it('falls back when the tooltip rect cannot reveal a direction yet', () => {
    const anchorRect = createRect({ top: 40, bottom: 72, left: 100, right: 132, width: 32, height: 32 });
    const tipRect = createRect();

    expect(inferPlacementFromRects(tipRect, anchorRect, 'left')).toBe('left');
  });
});

describe('placementToTranslate', () => {
  it('maps logical placements to translate directions', () => {
    expect(placementToTranslate('top', '0.25rem')).toBe('0 calc(-1 * 0.25rem)');
    expect(placementToTranslate('bottom', '0.25rem')).toBe('0 0.25rem');
    expect(placementToTranslate('start', '0.25rem')).toBe('calc(-1 * 0.25rem) 0');
    expect(placementToTranslate('end', '0.25rem')).toBe('0.25rem 0');
  });

  it('returns empty translate for zero offsets', () => {
    expect(placementToTranslate('top', '0')).toBe('');
    expect(placementToTranslate('top', '0px')).toBe('');
  });
});
