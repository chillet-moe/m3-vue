import type { NormalizedTooltipOptions, Placement, TooltipBindingValue } from './types';

let uid = 0;
type PhysicalPlacement = 'top' | 'bottom' | 'left' | 'right';

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
  };

  if (typeof binding === 'string') {
    const maybe = binding.trim();
    // Allow a short string binding to target an existing tooltip element when it looks like a selector.
    if ((maybe.startsWith('#') || maybe.startsWith('.')) && document.querySelector(maybe)) {
      return { ...defaults, target: maybe };
    }
    return { ...defaults, content: binding };
  }

  if (isEl(binding)) {
    return { ...defaults, target: binding };
  }

  return { ...defaults, ...binding };
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
  return typeof CSS !== 'undefined' && CSS.supports?.('position-anchor: --a') && CSS.supports?.('position-area: block-start');
}

export function supportsPopover(el: HTMLElement) {
  return typeof (el as HTMLElement & { showPopover?: unknown }).showPopover === 'function'
    && typeof (el as HTMLElement & { hidePopover?: unknown }).hidePopover === 'function';
}

export function getTipFromTarget(target: string | HTMLElement | undefined): HTMLElement | null {
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

  const { direction, writingMode } = window.getComputedStyle(anchor);
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

export function positionFallback(tip: HTMLElement, anchor: HTMLElement, placement: Placement) {
  const gap = 10;
  const pad = 8;

  const r = anchor.getBoundingClientRect();
  const tr = tip.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const resolvedPlacement = resolveFallbackPlacement(anchor, placement);

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
}

export function ensureTipElement(opts: NormalizedTooltipOptions, trigger: HTMLElement) {
  let tip = getTipFromTarget(opts.target);
  const created = !tip;

  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'vtt-popover';
    tip.textContent = opts.content ?? '';
    document.body.appendChild(tip);
  }

  if (!tip.hasAttribute('popover')) {
    tip.setAttribute('popover', opts.popoverType);
  }

  tip.classList.add('vtt-popover');

  if (opts.interactive) {
    tip.setAttribute('role', 'dialog');
    trigger.setAttribute('aria-haspopup', 'dialog');
  } else {
    tip.setAttribute('role', 'tooltip');
    trigger.setAttribute('aria-haspopup', 'true');
  }

  if (!tip.id) tip.id = `vtt-${++uid}`;
  trigger.setAttribute('aria-controls', tip.id);
  trigger.classList.add('vtt-trigger');

  return { tip, created };
}
