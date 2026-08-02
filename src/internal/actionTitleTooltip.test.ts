// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { actionTitleTooltipAttribute, registerActionTitleTooltip } from './actionTitleTooltip';

function createTrigger(content: string) {
  const trigger = document.createElement('button');
  trigger.setAttribute(actionTitleTooltipAttribute, content);
  document.body.appendChild(trigger);
  return trigger;
}

describe('shared action title tooltip runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('does not create tooltip DOM or anchors until a registered trigger opens', () => {
    const trigger = createTrigger('Settings');
    const cleanup = registerActionTitleTooltip(trigger);

    expect(document.body.querySelector('.m3-tooltip')).toBeNull();
    expect(trigger.style.getPropertyValue('anchor-name')).toBe('');

    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.runOnlyPendingTimers();

    const tip = document.body.querySelector<HTMLElement>('.m3-tooltip');
    expect(tip?.textContent).toBe('Settings');
    expect(tip?.getAttribute('role')).toBe('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(tip?.id);
    expect(trigger.style.getPropertyValue('anchor-name')).toContain('--vtt-anchor-');

    cleanup();
    expect(document.body.querySelector('.m3-tooltip')).toBeNull();
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    expect(trigger.style.getPropertyValue('anchor-name')).toBe('');
  });

  it('reuses one tooltip while moving the active anchor between triggers', () => {
    const first = createTrigger('First');
    const second = createTrigger('Second');
    const cleanupFirst = registerActionTitleTooltip(first);
    const cleanupSecond = registerActionTitleTooltip(second);

    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.runOnlyPendingTimers();
    const tip = document.body.querySelector<HTMLElement>('.m3-tooltip');

    second.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.runOnlyPendingTimers();

    expect(document.body.querySelectorAll('.m3-tooltip')).toHaveLength(1);
    expect(document.body.querySelector('.m3-tooltip')).toBe(tip);
    expect(tip?.textContent).toBe('Second');
    expect(first.style.getPropertyValue('anchor-name')).toBe('');
    expect(second.style.getPropertyValue('anchor-name')).toContain('--vtt-anchor-');

    cleanupFirst();
    cleanupSecond();
  });

  it('delegates pointer hover with the plain tooltip delays', () => {
    const trigger = createTrigger('Hovered');
    const cleanup = registerActionTitleTooltip(trigger);

    trigger.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    vi.advanceTimersByTime(59);
    expect(document.body.querySelector('.m3-tooltip')).toBeNull();

    vi.advanceTimersByTime(1);
    expect(document.body.querySelector('.m3-tooltip')?.textContent).toBe('Hovered');

    trigger.dispatchEvent(new MouseEvent('pointerout', { bubbles: true }));
    vi.advanceTimersByTime(200);
    expect(document.body.querySelector<HTMLElement>('.m3-tooltip')?.hidden).toBe(true);

    cleanup();
  });

  it('opens on touch long press and suppresses the resulting click', () => {
    const trigger = createTrigger('Touched');
    const cleanup = registerActionTitleTooltip(trigger);
    const pointerDown = new MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 20 });
    Object.defineProperty(pointerDown, 'pointerType', { value: 'touch' });

    trigger.dispatchEvent(pointerDown);
    vi.advanceTimersByTime(450);
    expect(document.body.querySelector('.m3-tooltip')?.textContent).toBe('Touched');

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    trigger.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);

    cleanup();
  });

  it('does not schedule hover work for an empty title registration', () => {
    const trigger = createTrigger('');
    const cleanup = registerActionTitleTooltip(trigger);
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

    trigger.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));

    expect(setTimeoutSpy).not.toHaveBeenCalled();
    cleanup();
    setTimeoutSpy.mockRestore();
  });

  it('updates only the active tooltip and releases it when a recycled trigger unregisters', () => {
    const trigger = createTrigger('Before');
    const cleanup = registerActionTitleTooltip(trigger);

    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.runOnlyPendingTimers();
    const tip = document.body.querySelector<HTMLElement>('.m3-tooltip');

    trigger.setAttribute(actionTitleTooltipAttribute, 'After');
    cleanup.update('After');
    expect(tip?.textContent).toBe('After');

    trigger.remove();
    cleanup();
    expect(document.body.querySelector('.m3-tooltip')).toBeNull();
    expect(trigger.style.getPropertyValue('anchor-name')).toBe('');
  });
});
