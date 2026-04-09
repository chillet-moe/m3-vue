import {
  areNormalizedTooltipOptionsEqual,
  ensureTipElement,
  normalizeBinding,
  placementToTranslate,
  positionFallback,
  resolveFallbackPlacement,
  resolveRenderedPlacement,
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

export function setupTooltip(
  trigger: HTMLElement,
  binding: TooltipBindingValue,
  options: {
    anchor?: HTMLElement;
    manual?: boolean;
  } = {},
): State {
  let opts = normalizeBinding(binding);
  let { tip, created } = ensureTipElement(opts, trigger);

  const anchor = options.anchor ?? trigger;
  const canPopover = supportsPopover(tip);
  const canAnchor = supportsAnchorPositioning();
  const anchorName = `--vtt-anchor-${tip.id}`;
  const animMs = opts.animDuration;
  type DeferredOffsetHandle = { kind: 'idle'; id: number } | { kind: 'timeout'; id: number } | null;
  const fallbackPlacements = new Map<Placement, ReturnType<typeof resolveFallbackPlacement>>();
  const getFallbackPlacement = (placement = opts.placement) => {
    const cached = fallbackPlacements.get(placement);
    if (cached) {
      return cached;
    }

    const resolvedPlacement = resolveFallbackPlacement(anchor, placement);
    fallbackPlacements.set(placement, resolvedPlacement);
    return resolvedPlacement;
  };
  const invalidateFallbackPlacements = () => {
    fallbackPlacements.clear();
  };
  const applyOffsetCSS = (placement: Placement | ReturnType<typeof resolveFallbackPlacement> = opts.placement) => {
    const translate = placementToTranslate(placement, opts.offset);

    if (translate) {
      tip.style.setProperty('translate', translate);
      return;
    }

    tip.style.removeProperty('translate');
  };
  let deferredOffsetHandle: DeferredOffsetHandle = null;
  const cancelDeferredOffset = () => {
    if (!deferredOffsetHandle) {
      return;
    }

    if (deferredOffsetHandle.kind === 'idle') {
      (
        window as Window &
          typeof globalThis & {
            cancelIdleCallback?: (handle: number) => void;
          }
      ).cancelIdleCallback?.(deferredOffsetHandle.id);
    } else {
      window.clearTimeout(deferredOffsetHandle.id);
    }

    deferredOffsetHandle = null;
  };
  const scheduleDeferredOffset = () => {
    cancelDeferredOffset();
    if (isOpen) {
      return;
    }

    const run = () => {
      deferredOffsetHandle = null;
      if (isOpen) {
        return;
      }
      applyOffsetCSS(opts.placement);
    };

    const idleApi = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      };

    if (idleApi.requestIdleCallback) {
      deferredOffsetHandle = {
        kind: 'idle',
        id: idleApi.requestIdleCallback(
          () => {
            run();
          },
          { timeout: 200 },
        ),
      };
      return;
    }

    deferredOffsetHandle = {
      kind: 'timeout',
      id: window.setTimeout(run, 0),
    };
  };

  anchor.style.setProperty('anchor-name', anchorName);
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

    tip.style.removeProperty('translate');

    const fallbackPlacement = getFallbackPlacement(opts.placement);
    const effectivePlacement = canAnchor
      ? resolveRenderedPlacement(tip, anchor, opts.placement, fallbackPlacement)
      : positionFallback(tip, anchor, opts.placement, fallbackPlacement);

    applyOffsetCSS(effectivePlacement);
  };

  const openNow = () => {
    clearTimers();
    cancelDeferredOffset();
    if (isOpen) return;

    isOpen = true;
    setExpanded(true);

    if (canPopover) {
      tip.style.visibility = 'hidden';
      try {
        (tip as HTMLElement & { showPopover: () => void }).showPopover();
      } catch {}
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
      } catch {}
      scheduleDeferredOffset();
      return;
    }

    tip.dataset.vttOpen = '0';
    window.setTimeout(() => {
      if (tip.dataset.vttOpen === '1') return;
      tip.hidden = true;
      scheduleDeferredOffset();
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
  const on = <T extends Event>(
    target: EventTarget,
    type: string,
    fn: (event: T) => void,
    opt?: AddEventListenerOptions,
  ) => target.addEventListener(type, fn as EventListener, { ...opt, signal: ac.signal });

  if (!options.manual) {
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

    on(tip, 'pointerenter', onTipEnter);
    on(tip, 'pointerleave', onTipLeave);
    on(tip, 'focusin', onFocusIn);
    on(tip, 'focusout', onFocusOut);
    on(tip, 'keydown', onKeyDown);

    on(document, 'pointerdown', onDocPointerDown, { capture: true });
  }

  on(window, 'scroll', onScrollOrResize, { passive: true });
  on(window, 'resize', onScrollOrResize);

  setExpanded(false);
  if (!canPopover) tip.hidden = true;
  scheduleDeferredOffset();

  const cleanup = () => {
    clearTimers();
    cancelDeferredOffset();
    ac.abort();

    trigger.classList.remove('vtt-trigger');
    trigger.removeAttribute('aria-controls');
    trigger.removeAttribute('aria-expanded');
    trigger.removeAttribute('aria-haspopup');
    anchor.style.removeProperty('anchor-name');

    tip.style.removeProperty('position-anchor');
    tip.style.removeProperty('position-area');
    tip.style.removeProperty('position-try-fallbacks');
    tip.style.removeProperty('position-visibility');
    tip.style.removeProperty('left');
    tip.style.removeProperty('top');
    tip.style.removeProperty('translate');

    if (created) {
      tip.remove();
    }
  };

  let state!: State;

  const update = (next: TooltipBindingValue) => {
    const nextOpts = normalizeBinding(next);
    if (areNormalizedTooltipOptionsEqual(opts, nextOpts)) {
      return;
    }

    const targetChanged = opts.target !== nextOpts.target;
    const contentChanged = opts.content !== nextOpts.content;

    opts = nextOpts;
    invalidateFallbackPlacements();

    if (targetChanged) {
      cleanup();
      const rebuilt = setupTooltip(trigger, next, options);
      state.tip = rebuilt.tip;
      state.cleanup = rebuilt.cleanup;
      state.update = rebuilt.update;
      state.show = rebuilt.show;
      state.hide = rebuilt.hide;
      state.reposition = rebuilt.reposition;
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

    if (created) {
      tip.textContent = opts.content ?? '';
    }

    if (canAnchor) {
      tip.style.setProperty('position-area', placementToArea(opts.placement));
    }

    if (isOpen) {
      updatePositionIfNeeded();
      return;
    }

    scheduleDeferredOffset();
  };

  state = {
    tip,
    cleanup,
    update,
    show: openNow,
    hide: closeNow,
    reposition: updatePositionIfNeeded,
  };

  return state;
}
