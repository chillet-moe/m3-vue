import type { ObjectDirective } from 'vue';

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';

export type VTooltipBinding =
  | string
  | HTMLElement
  | {
      target?: string | HTMLElement; // 现有 popover 元素（推荐，内容可用 Vue 渲染）
      content?: string; // 纯文本（会自动创建 popover 元素）
      placement?: Placement; // 不跟随鼠标，只做固定方位 + 自动翻转
      interactive?: boolean; // true 时会用更合理的 aria 属性（见下）
      popoverType?: 'hint' | 'auto' | 'manual';
      openDelay?: number; // hover/focus 打开延迟
      closeDelay?: number; // 离开后关闭延迟（便于移入 tooltip 点击）
      longpressDelay?: number; // 触摸长按时间
    };

type State = {
  tip: HTMLElement;
  cleanup: () => void;
  update: (next: VTooltipBinding) => void;
};

const STATE = Symbol('vtt_state');
let uid = 0;

function isEl(v: any): v is HTMLElement {
  return v && typeof v === 'object' && v.nodeType === 1;
}

function normalize(binding: VTooltipBinding) {
  const defaults = {
    placement: 'top' as Placement,
    interactive: true,
    popoverType: 'hint' as const, // 不干扰已打开的 auto popover :contentReference[oaicite:3]{index=3}
    openDelay: 60,
    closeDelay: 80,
    longpressDelay: 450,
    animDuration: 120,
  };

  if (typeof binding === 'string') {
    // 如果是选择器且能找到元素，视为 target；否则视为 content
    const maybe = binding.trim();
    if ((maybe.startsWith('#') || maybe.startsWith('.')) && document.querySelector(maybe)) {
      return { ...defaults, target: maybe };
    }
    return { ...defaults, content: binding };
  }

  if (isEl(binding)) return { ...defaults, target: binding };

  return { ...defaults, ...binding };
}

function supportsAnchorPositioning() {
  return (
    typeof CSS !== 'undefined' && CSS.supports?.('position-anchor: --a') && CSS.supports?.('position-area: block-start')
  );
}

function supportsPopover(el: HTMLElement) {
  return typeof (el as any).showPopover === 'function' && typeof (el as any).hidePopover === 'function';
}

function getTipFromTarget(target: string | HTMLElement | undefined): HTMLElement | null {
  if (!target) return null;
  if (typeof target === 'string') return document.querySelector(target) as HTMLElement | null;
  return target;
}

function firstFocusable(root: HTMLElement): HTMLElement | null {
  const sel =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  return root.querySelector(sel);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * JS fallback 定位（Anchor 不支持时用）
 * 不跟随鼠标，只根据触发元素 rect 定位，并在出屏时翻转一次。
 */
function positionFallback(tip: HTMLElement, trigger: HTMLElement, placement: Placement) {
  const gap = 10;
  const pad = 8;

  const r = trigger.getBoundingClientRect();

  // tip 可能刚显示出来，先读一次尺寸
  const tr = tip.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const tryPlace = (p: Placement) => {
    let x = 0,
      y = 0;

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

    x = clamp(x, pad, vw - tr.width - pad);
    y = clamp(y, pad, vh - tr.height - pad);

    return { x, y };
  };

  // 简单翻转策略：主轴不够就翻一次
  let p = placement;
  if (p === 'top' && r.top - tr.height - gap < pad) p = 'bottom';
  else if (p === 'bottom' && r.bottom + tr.height + gap > vh - pad) p = 'top';
  else if (p === 'left' && r.left - tr.width - gap < pad) p = 'right';
  else if (p === 'right' && r.right + tr.width + gap > vw - pad) p = 'left';

  const { x, y } = tryPlace(p);

  tip.style.position = 'fixed';
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}

function ensureTipElement(opts: ReturnType<typeof normalize>, trigger: HTMLElement) {
  let tip = getTipFromTarget(opts.target);

  const created = !tip;
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'vtt-popover';
    tip.textContent = opts.content ?? '';
    document.body.appendChild(tip);
  }

  // popover type：默认 hint（hover/focus/长按打开不会干扰 auto popover）:contentReference[oaicite:4]{index=4}
  if (!tip.hasAttribute('popover')) tip.setAttribute('popover', opts.popoverType);

  tip.classList.add('vtt-popover');

  // ARIA：严格来说 tooltip 不应含交互控件；既然你需要可点击，建议视作 popover（dialog-like）
  // 这里给一个更务实的默认：interactive=true => role="dialog" + aria-haspopup
  if (opts.interactive) {
    tip.setAttribute('role', 'dialog');
    trigger.setAttribute('aria-haspopup', 'dialog');
  } else {
    tip.setAttribute('role', 'tooltip');
    trigger.setAttribute('aria-haspopup', 'true');
  }

  if (!tip.id) tip.id = `vtt-${++uid}`;
  trigger.setAttribute('aria-controls', tip.id);

  // 触发元素样式辅助（移动端长按）
  trigger.classList.add('vtt-trigger');

  return { tip, created };
}

function setup(trigger: HTMLElement, binding: VTooltipBinding): State {
  let opts = normalize(binding);
  let { tip, created } = ensureTipElement(opts, trigger);

  const canPopover = supportsPopover(tip);
  const canAnchor = supportsAnchorPositioning();

  // anchor-name / position-anchor 需要每对 trigger+tip 唯一标识
  const anchorName = `--vtt-anchor-${tip.id}`;

  const animMs = opts.animDuration ?? 120;

  // 用 setProperty 避免 CSSOM 命名差异
  trigger.style.setProperty('anchor-name', anchorName);
  tip.style.setProperty('position-anchor', anchorName);

  // placement：逻辑方向用 block-start/end 更稳（writing-mode 也更一致）
  const placementToArea = (p: Placement) => {
    if (p === 'top') return 'block-start';
    if (p === 'bottom') return 'block-end';
    if (p === 'left' || p === 'start') return 'inline-start';
    if (p === 'right' || p === 'end') return 'inline-end';
    return 'block-start';
  };

  function applyAnchorCSS() {
    tip.style.setProperty('position', 'fixed');
    tip.style.setProperty('position-area', placementToArea(opts.placement));
    // 出屏自动翻转：position-try-fallbacks :contentReference[oaicite:5]{index=5}
    tip.style.setProperty('position-try-fallbacks', 'flip-block, flip-inline, flip-block flip-inline');
    // anchor 滚出屏时隐藏：position-visibility :contentReference[oaicite:6]{index=6}
    tip.style.setProperty('position-visibility', 'anchors-visible');
    // 清掉 fallback left/top
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
    openTimer = closeTimer = longPressTimer = 0;
  };

  const setExpanded = (v: boolean) => {
    trigger.setAttribute('aria-expanded', v ? 'true' : 'false');
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
      // 避免刚打开时闪一下：先 invisible，定位后再显示
      tip.style.visibility = 'hidden';
      try {
        (tip as any).showPopover();
      } catch {
        // 某些实现需要元素已连接到 DOM；这里 tip 已在 DOM
      }
      requestAnimationFrame(() => {
        updatePositionIfNeeded();
        tip.style.visibility = '';
      });
    } else {
      tip.hidden = false;
      //updatePositionIfNeeded();
      tip.dataset.vttOpen = '0';
      requestAnimationFrame(() => {
        tip.dataset.vttOpen = '1';
        updatePositionIfNeeded();
      });
    }
  };

  const closeNow = () => {
    clearTimers();
    if (!isOpen) return;

    isOpen = false;
    setExpanded(false);

    if (canPopover) {
      try {
        (tip as any).hidePopover();
      } catch {}
    } else {
      //tip.hidden = true;
      tip.dataset.vttOpen = '0';
      window.setTimeout(() => {
        // 如果这段时间内又被打开了，就别隐藏
        if (tip.dataset.vttOpen === '1') return;
        tip.hidden = true;
      }, animMs);
    }
  };

  const scheduleOpen = (delay: number) => {
    clearTimers();
    openTimer = window.setTimeout(openNow, delay);
  };

  const scheduleClose = (delay: number) => {
    clearTimers();
    closeTimer = window.setTimeout(() => {
      // 如果焦点还在 trigger 或 tip 内，别关
      const ae = document.activeElement as Element | null;
      if (ae && (trigger.contains(ae) || tip.contains(ae))) return;
      closeNow();
    }, delay);
  };

  // outside click / pointerdown close（对触摸特别重要）
  const onDocPointerDown = (ev: Event) => {
    const t = ev.target as Node | null;
    if (!t) return;
    if (trigger.contains(t) || tip.contains(t)) return;
    closeNow();
  };

  // ESC close
  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') closeNow();
  };

  // hover / focus 行为（允许移入 tip 点击，所以 closeDelay 需要一点缓冲）
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

  // 触摸长按：不跟随鼠标，只长按打开；打开后可点击 tip 内内容
  let startX = 0,
    startY = 0;

  const cancelLongPress = () => {
    if (longPressTimer) window.clearTimeout(longPressTimer);
    longPressTimer = 0;
  };

  const onPointerDown = (ev: PointerEvent) => {
    if (ev.pointerType !== 'touch') return;

    // 如果刚刚是长按打开导致的 click，直接忽略这个 click
    startX = ev.clientX;
    startY = ev.clientY;

    cancelLongPress();
    longPressTimer = window.setTimeout(() => {
      suppressClickUntil = Date.now() + 500;
      openNow();
    }, opts.longpressDelay);
  };

  const onPointerMove = (ev: PointerEvent) => {
    if (!longPressTimer) return;
    if (ev.pointerType !== 'touch') return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (Math.hypot(dx, dy) > 10) cancelLongPress();
  };

  const onPointerUpCancel = (ev: PointerEvent) => {
    if (ev.pointerType !== 'touch') return;
    cancelLongPress();
  };

  const onClick = (ev: MouseEvent) => {
    // 避免“长按打开后松手触发 click”导致立刻又执行其它逻辑
    if (Date.now() < suppressClickUntil) {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
  };

  const onContextMenu = (ev: MouseEvent) => {
    // 一些平台长按会触发 contextmenu；你要的语义是“长按显示提示”
    if (isOpen) ev.preventDefault();
  };

  // 滚动/尺寸变化时更新 fallback 定位；Anchor 情况下由浏览器处理
  const onScrollOrResize = () => updatePositionIfNeeded();

  // 绑定监听 + 清理
  const ac = new AbortController();
  const on = (t: EventTarget, type: string, fn: any, opt?: AddEventListenerOptions) =>
    t.addEventListener(type, fn, { ...opt, signal: ac.signal });

  // trigger
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

  // tip（允许移入点击）
  on(tip, 'pointerenter', onTipEnter);
  on(tip, 'pointerleave', onTipLeave);
  on(tip, 'focusin', onFocusIn);
  on(tip, 'focusout', onFocusOut);
  on(tip, 'keydown', onKeyDown);

  // document：outside close
  on(document, 'pointerdown', onDocPointerDown, { capture: true });

  // fallback reposition
  on(window, 'scroll', onScrollOrResize, { passive: true });
  on(window, 'resize', onScrollOrResize);

  // 初始状态
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
    if (created) tip.remove();
  };

  const update = (next: VTooltipBinding) => {
    // 简化处理：若 target/content 类型变化，先清理再重建
    const nextOpts = normalize(next);

    const nextTip = getTipFromTarget(nextOpts.target) ?? (nextOpts.content ? null : null);

    const targetChanged =
      (typeof opts.target === 'string' ? opts.target : (opts.target as any)?.id) !==
      (typeof nextOpts.target === 'string' ? nextOpts.target : (nextOpts.target as any)?.id);

    const contentChanged = opts.content !== nextOpts.content;

    opts = nextOpts;

    if (targetChanged || (created && contentChanged)) {
      cleanup();
      const st = setup(trigger, next);
      (trigger as any)[STATE] = st;
      return;
    }

    // 同一个 tip：只更新可变项
    tip.setAttribute('popover', opts.popoverType);
    if (opts.interactive) {
      tip.setAttribute('role', 'dialog');
      trigger.setAttribute('aria-haspopup', 'dialog');
    } else {
      tip.setAttribute('role', 'tooltip');
      trigger.setAttribute('aria-haspopup', 'true');
    }

    if (canAnchor) {
      tip.style.setProperty('position-area', placementToArea(opts.placement));
    }
    updatePositionIfNeeded();
  };

  return { tip, cleanup, update };
}

export type TooltipDirective = ObjectDirective<HTMLElement, VTooltipBinding>;

declare module 'vue' {
  export interface GlobalDirectives {
    vTooltip: TooltipDirective;
  }
}

export default {
  mounted(el, binding) {
    (el as any)[STATE] = setup(el, binding.value);
  },
  updated(el, binding) {
    const st: State | undefined = (el as any)[STATE];
    if (!st) return;
    st.update(binding.value);
  },
  unmounted(el) {
    const st: State | undefined = (el as any)[STATE];
    st?.cleanup();
    delete (el as any)[STATE];
  },
} satisfies TooltipDirective;
