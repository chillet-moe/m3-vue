import {
  ensureTipElement,
  normalizeBinding,
  positionFallback,
  supportsAnchorPositioning,
  supportsPopover,
} from './helpers';
import type { Placement, State, TooltipBindingValue } from './types';

function placementToArea(p: Placement) {
  if (p === 'top') return 'block-start';
  if (p === 'bottom') return 'block-end';
  if (p === 'left' || p === 'start') return 'inline-start';
  if (p === 'right' || p === 'end') return 'inline-end';
  return 'block-start';
}

export function setupTooltip(trigger: HTMLElement, binding: TooltipBindingValue): State {
  let opts = normalizeBinding(binding);
  let { tip, created } = ensureTipElement(opts, trigger);

  const canPopover = supportsPopover(tip);
  const canAnchor = supportsAnchorPositioning();
  const anchorName = `--vtt-anchor-${tip.id}`;
  const animMs = opts.animDuration;

  // Anchor Positioning gives us native placement; the fallback path below handles older browsers.
  trigger.style.setProperty('anchor-name', anchorName);
  tip.style.setProperty('position-anchor', anchorName);

  function applyAnchorCSS() {
    tip.style.setProperty('position', 'fixed');
    tip.style.setProperty('position-area', placementToArea(opts.placement));
    tip.style.setProperty('position-try-fallbacks', 'flip-block, flip-inline, flip-block flip-inline');
    tip.style.setProperty('position-visibility', 'anchors-visible');
    tip.style.removeProperty('left');
    tip.style.removeProperty('top');
    tip.dataset.vttFallback = '0';
  }

  function applyFallbackCSS() {
    tip.dataset.vttFallback = '1';
    tip.style.setProperty('position', 'fixed');
    tip.style.removeProperty('position-area');
    tip.style.removeProperty('position-try-fallbacks');
    tip.style.removeProperty('position-visibility');
  }

  if (canAnchor) applyAnchorCSS();
  else applyFallbackCSS();

  let openTimer = 0;
  let closeTimer = 0;
  let longPressTimer = 0;
  let suppressClickUntil = 0;
  let isOpen = false;

  const clearTimers = () => {
    if (openTimer) window.clearTimeout(openTimer);
    if (closeTimer) window.clearTimeout(closeTimer);
    if (longPressTimer) window.clearTimeout(longPressTimer);
    openTimer = 0;
    closeTimer = 0;
    longPressTimer = 0;
  };

  const setExpanded = (value: boolean) => {
    trigger.setAttribute('aria-expanded', value ? 'true' : 'false');
  };

  const updatePositionIfNeeded = () => {
    if (!isOpen) return;
    if (!canAnchor) positionFallback(tip, trigger, opts.placement);
  };

  const openNow = () => {
    clearTimers();
    if (isOpen) return;

    isOpen = true;
    setExpanded(true);

    if (canPopover) {
      // Keep the element invisible until the browser has applied layout and popover state.
      tip.style.visibility = 'hidden';
      try {
        (tip as HTMLElement & { showPopover: () => void }).showPopover();
      } catch {
        // Ignore browsers with partially implemented popover APIs.
      }
      requestAnimationFrame(() => {
        updatePositionIfNeeded();
        tip.style.visibility = '';
      });
      return;
    }

    tip.hidden = false;
    tip.dataset.vttOpen = '0';
    requestAnimationFrame(() => {
      tip.dataset.vttOpen = '1';
      updatePositionIfNeeded();
    });
  };

  const closeNow = () => {
    clearTimers();
    if (!isOpen) return;

    isOpen = false;
    setExpanded(false);

    if (canPopover) {
      try {
        (tip as HTMLElement & { hidePopover: () => void }).hidePopover();
      } catch {
        // Ignore browsers with partially implemented popover APIs.
      }
      return;
    }

    tip.dataset.vttOpen = '0';
    window.setTimeout(() => {
      if (tip.dataset.vttOpen === '1') return;
      tip.hidden = true;
    }, animMs);
  };

  const scheduleOpen = (delay: number) => {
    clearTimers();
    openTimer = window.setTimeout(openNow, delay);
  };

  const scheduleClose = (delay: number) => {
    clearTimers();
    closeTimer = window.setTimeout(() => {
      const ae = document.activeElement as Element | null;
      if (ae && (trigger.contains(ae) || tip.contains(ae))) return;
      closeNow();
    }, delay);
  };

  // Touch devices use long press to open instead of hover, so close when pointerdown happens outside.
  const onDocPointerDown = (ev: Event) => {
    const target = ev.target as Node | null;
    if (!target) return;
    if (trigger.contains(target) || tip.contains(target)) return;
    closeNow();
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') closeNow();
  };

  const onTriggerEnter = () => scheduleOpen(opts.openDelay);
  const onTriggerLeave = () => scheduleClose(opts.closeDelay);
  const onTipEnter = () => scheduleOpen(0);
  const onTipLeave = () => scheduleClose(opts.closeDelay);
  const onFocusIn = () => scheduleOpen(0);
  const onFocusOut = (ev: FocusEvent) => {
    const next = ev.relatedTarget as Node | null;
    if (next && (trigger.contains(next) || tip.contains(next))) return;
    scheduleClose(0);
  };

  let startX = 0;
  let startY = 0;

  const cancelLongPress = () => {
    if (longPressTimer) window.clearTimeout(longPressTimer);
    longPressTimer = 0;
  };

  const onPointerDown = (ev: PointerEvent) => {
    if (ev.pointerType !== 'touch') return;

    startX = ev.clientX;
    startY = ev.clientY;

    cancelLongPress();
    longPressTimer = window.setTimeout(() => {
      // Ignore the synthetic click that some browsers dispatch after a successful long press.
      suppressClickUntil = Date.now() + 500;
      openNow();
    }, opts.longpressDelay);
  };

  const onPointerMove = (ev: PointerEvent) => {
    if (!longPressTimer || ev.pointerType !== 'touch') return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (Math.hypot(dx, dy) > 10) cancelLongPress();
  };

  const onPointerUpCancel = (ev: PointerEvent) => {
    if (ev.pointerType !== 'touch') return;
    cancelLongPress();
  };

  const onClick = (ev: MouseEvent) => {
    if (Date.now() >= suppressClickUntil) return;
    ev.preventDefault();
    ev.stopPropagation();
  };

  const onContextMenu = (ev: MouseEvent) => {
    if (isOpen) ev.preventDefault();
  };

  const onScrollOrResize = () => updatePositionIfNeeded();

  const ac = new AbortController();
  const on = (target: EventTarget, type: string, fn: EventListenerOrEventListenerObject, opt?: AddEventListenerOptions) =>
    target.addEventListener(type, fn, { ...opt, signal: ac.signal });

  on(trigger, 'pointerenter', onTriggerEnter);
  on(trigger, 'pointerleave', onTriggerLeave);
  on(trigger, 'focusin', onFocusIn);
  on(trigger, 'focusout', onFocusOut);
  on(trigger, 'keydown', onKeyDown);
  on(trigger, 'pointerdown', onPointerDown);
  on(trigger, 'pointermove', onPointerMove);
  on(trigger, 'pointerup', onPointerUpCancel);
  on(trigger, 'pointercancel', onPointerUpCancel);
  on(trigger, 'click', onClick);
  on(trigger, 'contextmenu', onContextMenu);

  // Keep the tooltip open while the pointer/focus moves into rich interactive content.
  on(tip, 'pointerenter', onTipEnter);
  on(tip, 'pointerleave', onTipLeave);
  on(tip, 'focusin', onFocusIn);
  on(tip, 'focusout', onFocusOut);
  on(tip, 'keydown', onKeyDown);

  on(document, 'pointerdown', onDocPointerDown, { capture: true });
  on(window, 'scroll', onScrollOrResize, { passive: true });
  on(window, 'resize', onScrollOrResize);

  setExpanded(false);
  if (!canPopover) tip.hidden = true;

  const cleanup = () => {
    clearTimers();
    ac.abort();

    trigger.classList.remove('vtt-trigger');
    trigger.removeAttribute('aria-controls');
    trigger.removeAttribute('aria-expanded');
    trigger.removeAttribute('aria-haspopup');
    trigger.style.removeProperty('anchor-name');

    tip.style.removeProperty('position-anchor');
    tip.style.removeProperty('position-area');
    tip.style.removeProperty('position-try-fallbacks');
    tip.style.removeProperty('position-visibility');
    tip.style.removeProperty('left');
    tip.style.removeProperty('top');

    if (created) {
      tip.remove();
    }
  };

  let state!: State;

  const update = (next: TooltipBindingValue) => {
    const nextOpts = normalizeBinding(next);
    const targetChanged =
      (typeof opts.target === 'string' ? opts.target : opts.target?.id) !==
      (typeof nextOpts.target === 'string' ? nextOpts.target : nextOpts.target?.id);
    const contentChanged = opts.content !== nextOpts.content;

    opts = nextOpts;

    // Rebuild when the host switches between generated content and an external tooltip target.
    if (targetChanged || (created && contentChanged)) {
      cleanup();
      const rebuilt = setupTooltip(trigger, next);
      state.tip = rebuilt.tip;
      state.cleanup = rebuilt.cleanup;
      state.update = rebuilt.update;
      return;
    }

    tip.setAttribute('popover', opts.popoverType);
    if (opts.interactive) {
      tip.setAttribute('role', 'dialog');
      trigger.setAttribute('aria-haspopup', 'dialog');
    } else {
      tip.setAttribute('role', 'tooltip');
      trigger.setAttribute('aria-haspopup', 'true');
    }

    if (opts.content !== undefined && created) {
      tip.textContent = opts.content;
    }

    if (canAnchor) {
      tip.style.setProperty('position-area', placementToArea(opts.placement));
    }

    updatePositionIfNeeded();
  };

  state = {
    tip,
    cleanup,
    update,
  };

  return state;
}
