import type { NormalizedTooltipOptions, Placement, TooltipBindingValue, TooltipTriggerAriaMode } from './types';

let uid = 0;
export type PhysicalPlacement = 'top' | 'bottom' | 'left' | 'right';

function isEl(value: unknown): value is HTMLElement {
  return Boolean(value) && typeof value === 'object' && (value as Node).nodeType === 1;
}

export function normalizeBinding(binding: TooltipBindingValue): NormalizedTooltipOptions {
  const defaults: NormalizedTooltipOptions = {
    placement: 'top',
    offset: '0.25rem',
    interactive: true,
    popoverType: 'hint',
    openDelay: 60,
    closeDelay: 80,
    longpressDelay: 450,
    animDuration: 120,
    variant: 'plain',
    triggerAria: 'controls',
  };

  if (typeof binding === 'string') {
    return { ...defaults, target: binding };
  }

  if (isEl(binding)) {
    return { ...defaults, target: binding };
  }

  return { ...defaults, ...binding };
}

function isSameTarget(a: NormalizedTooltipOptions['target'], b: NormalizedTooltipOptions['target']) {
  return a === b;
}

export function areNormalizedTooltipOptionsEqual(a: NormalizedTooltipOptions, b: NormalizedTooltipOptions) {
  return (
    isSameTarget(a.target, b.target) &&
    a.content === b.content &&
    a.placement === b.placement &&
    a.offset === b.offset &&
    a.interactive === b.interactive &&
    a.popoverType === b.popoverType &&
    a.openDelay === b.openDelay &&
    a.closeDelay === b.closeDelay &&
    a.longpressDelay === b.longpressDelay &&
    a.animDuration === b.animDuration &&
    a.variant === b.variant &&
    a.triggerAria === b.triggerAria
  );
}

function isZeroOffset(offset: string) {
  return /^0(?:\.0+)?(?:[a-z%]+)?$/i.test(offset.trim());
}

export function placementToTranslate(placement: Placement, offset: string) {
  if (isZeroOffset(offset)) {
    return '';
  }

  if (placement === 'top') {
    return `0 calc(-1 * ${offset})`;
  }

  if (placement === 'bottom') {
    return `0 ${offset}`;
  }

  if (placement === 'left' || placement === 'start') {
    return `calc(-1 * ${offset}) 0`;
  }

  return `${offset} 0`;
}

export function supportsAnchorPositioning() {
  return (
    typeof CSS !== 'undefined' && CSS.supports?.('position-anchor: --a') && CSS.supports?.('position-area: block-start')
  );
}

export function supportsPopover(el: HTMLElement) {
  return (
    typeof (el as HTMLElement & { showPopover?: unknown }).showPopover === 'function' &&
    typeof (el as HTMLElement & { hidePopover?: unknown }).hidePopover === 'function'
  );
}

export function getTipFromTarget(
  target: string | HTMLElement | undefined,
  document: Document = globalThis.document,
): HTMLElement | null {
  if (!target) return null;
  if (typeof target === 'string') return document.querySelector(target) as HTMLElement | null;
  return target;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function resolveFallbackPlacement(anchor: HTMLElement, placement: Placement): PhysicalPlacement {
  if (placement === 'left' || placement === 'right') {
    return placement;
  }

  const { direction, writingMode } = anchor.ownerDocument.defaultView!.getComputedStyle(anchor);
  const isVertical = writingMode.startsWith('vertical') || writingMode.startsWith('sideways');

  if (!isVertical) {
    const inlineStart = direction === 'rtl' ? 'right' : 'left';
    const inlineEnd = direction === 'rtl' ? 'left' : 'right';

    if (placement === 'start') return inlineStart;
    if (placement === 'end') return inlineEnd;
    if (placement === 'bottom') return 'bottom';
    return 'top';
  }

  let blockStart: PhysicalPlacement = writingMode.endsWith('-lr') ? 'left' : 'right';
  let blockEnd: PhysicalPlacement = writingMode.endsWith('-lr') ? 'right' : 'left';

  if (direction === 'rtl') {
    [blockStart, blockEnd] = [blockEnd, blockStart];
  }

  if (placement === 'start') return 'top';
  if (placement === 'end') return 'bottom';
  if (placement === 'bottom') return blockEnd;
  return blockStart;
}

export function inferPlacementFromRects(
  tipRect: DOMRect,
  anchorRect: DOMRect,
  fallbackPlacement: PhysicalPlacement,
): PhysicalPlacement {
  if (tipRect.width === 0 && tipRect.height === 0) {
    return fallbackPlacement;
  }

  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const anchorCenterY = anchorRect.top + anchorRect.height / 2;
  const tipCenterX = tipRect.left + tipRect.width / 2;
  const tipCenterY = tipRect.top + tipRect.height / 2;
  const dx = tipCenterX - anchorCenterX;
  const dy = tipCenterY - anchorCenterY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx < 0.5 && absDy < 0.5) {
    return fallbackPlacement;
  }

  if (absDy > absDx) {
    return dy < 0 ? 'top' : 'bottom';
  }

  if (absDx > absDy) {
    return dx < 0 ? 'left' : 'right';
  }

  if (fallbackPlacement === 'top' || fallbackPlacement === 'bottom') {
    return dy <= 0 ? 'top' : 'bottom';
  }

  return dx <= 0 ? 'left' : 'right';
}

export function resolveRenderedPlacement(
  tip: HTMLElement,
  anchor: HTMLElement,
  placement: Placement,
  fallbackPlacement = resolveFallbackPlacement(anchor, placement),
): PhysicalPlacement {
  return inferPlacementFromRects(tip.getBoundingClientRect(), anchor.getBoundingClientRect(), fallbackPlacement);
}

export function positionFallback(
  tip: HTMLElement,
  anchor: HTMLElement,
  placement: Placement,
  resolvedPlacement = resolveFallbackPlacement(anchor, placement),
): PhysicalPlacement {
  const gap = 10;
  const pad = 8;

  const r = anchor.getBoundingClientRect();
  const tr = tip.getBoundingClientRect();

  const vw = anchor.ownerDocument.defaultView!.innerWidth;
  const vh = anchor.ownerDocument.defaultView!.innerHeight;

  const tryPlace = (p: PhysicalPlacement) => {
    let x = 0;
    let y = 0;

    if (p === 'top') {
      x = r.left + r.width / 2 - tr.width / 2;
      y = r.top - tr.height - gap;
    } else if (p === 'bottom') {
      x = r.left + r.width / 2 - tr.width / 2;
      y = r.bottom + gap;
    } else if (p === 'left') {
      x = r.left - tr.width - gap;
      y = r.top + r.height / 2 - tr.height / 2;
    } else {
      x = r.right + gap;
      y = r.top + r.height / 2 - tr.height / 2;
    }

    return {
      x: clamp(x, pad, vw - tr.width - pad),
      y: clamp(y, pad, vh - tr.height - pad),
    };
  };

  let nextPlacement = resolvedPlacement;
  if (nextPlacement === 'top' && r.top - tr.height - gap < pad) nextPlacement = 'bottom';
  else if (nextPlacement === 'bottom' && r.bottom + tr.height + gap > vh - pad) nextPlacement = 'top';
  else if (nextPlacement === 'left' && r.left - tr.width - gap < pad) nextPlacement = 'right';
  else if (nextPlacement === 'right' && r.right + tr.width + gap > vw - pad) nextPlacement = 'left';

  const { x, y } = tryPlace(nextPlacement);

  tip.style.position = 'fixed';
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;

  return nextPlacement;
}

function addTokenAttr(el: HTMLElement, name: string, token: string) {
  const tokens = new Set((el.getAttribute(name) ?? '').split(/\s+/).filter(Boolean));
  tokens.add(token);
  el.setAttribute(name, Array.from(tokens).join(' '));
}

function removeTokenAttr(el: HTMLElement, name: string, token: string) {
  const tokens = (el.getAttribute(name) ?? '').split(/\s+/).filter((item) => item && item !== token);

  if (tokens.length > 0) {
    el.setAttribute(name, tokens.join(' '));
    return;
  }

  el.removeAttribute(name);
}

export function ensureTipElement(
  opts: NormalizedTooltipOptions,
  trigger: HTMLElement,
  triggerAria: TooltipTriggerAriaMode = 'controls',
) {
  const document = trigger.ownerDocument;
  let tip = getTipFromTarget(opts.target, document);
  const created = !tip;

  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'm3-tooltip vtt-popover';
    tip.dataset.scope = 'tooltip';
    tip.dataset.part = 'root';
    tip.dataset.variant = opts.variant;
    tip.textContent = opts.content ?? '';
    document.body.appendChild(tip);
  }

  if (!tip.hasAttribute('popover')) {
    tip.setAttribute('popover', opts.popoverType);
  }

  tip.classList.add('vtt-popover');

  if (opts.interactive) {
    tip.setAttribute('role', 'dialog');
  } else {
    tip.setAttribute('role', 'tooltip');
  }

  if (!tip.id) tip.id = `vtt-${++uid}`;
  const cleanupTriggerAttributes = () => {
    if (triggerAria === 'controls') {
      trigger.removeAttribute('aria-controls');
      trigger.removeAttribute('aria-expanded');
      trigger.removeAttribute('aria-haspopup');
      return;
    }

    if (triggerAria === 'describedby') {
      removeTokenAttr(trigger, 'aria-describedby', tip.id);
    }
  };

  if (triggerAria === 'controls') {
    trigger.setAttribute('aria-haspopup', opts.interactive ? 'dialog' : 'true');
    trigger.setAttribute('aria-controls', tip.id);
  } else if (triggerAria === 'describedby') {
    addTokenAttr(trigger, 'aria-describedby', tip.id);
  }

  trigger.classList.add('vtt-trigger');

  return { tip, created, cleanupTriggerAttributes };
}
