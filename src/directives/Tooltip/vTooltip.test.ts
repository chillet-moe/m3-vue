// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import vTooltip, { normalizeBinding } from './vTooltip';

function createTrigger() {
  const el = document.createElement('button');
  document.body.appendChild(el);
  return el;
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

    vTooltip.mounted?.(el, { value: 'Tooltip content' } as never, null as never, null as never);

    const tip = document.body.querySelector('.vtt-popover');
    expect(tip).not.toBeNull();
    expect(el.getAttribute('aria-controls')).toBe(tip?.id);

    vTooltip.unmounted?.(el, null as never, null as never);

    expect(document.body.querySelector('.vtt-popover')).toBeNull();
    expect(el.hasAttribute('aria-controls')).toBe(false);
  });

  it('rebuilds generated tooltip content on update', () => {
    const el = createTrigger();

    vTooltip.mounted?.(el, { value: 'Old content' } as never, null as never, null as never);
    let tip = document.body.querySelector('.vtt-popover');
    expect(tip?.textContent).toBe('Old content');

    vTooltip.updated?.(el, { value: 'New content', oldValue: 'Old content' } as never, null as never, null as never);
    tip = document.body.querySelector('.vtt-popover');

    expect(tip?.textContent).toBe('New content');
  });
});
