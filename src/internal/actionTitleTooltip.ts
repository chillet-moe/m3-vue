import { setupTooltip } from '@/directives/Tooltip/setup';

export const actionTitleTooltipAttribute = 'data-m3-action-title-tooltip';

type TooltipState = ReturnType<typeof setupTooltip>;

type SharedActionTitleTooltipRuntime = {
  register: (trigger: HTMLElement) => () => void;
};

const runtimes = new WeakMap<Document, SharedActionTitleTooltipRuntime>();

function createRuntime(document: Document, onEmpty: () => void): SharedActionTitleTooltipRuntime {
  const window = document.defaultView;
  const triggers = new Set<HTMLElement>();
  const abortController = new AbortController();
  let registrationCount = 0;
  let sharedTip: HTMLElement | undefined;
  let activeTrigger: HTMLElement | undefined;
  let activeState: TooltipState | undefined;
  let activeObserver: MutationObserver | undefined;
  let pendingTrigger: HTMLElement | undefined;
  let openTimer = 0;
  let closeTimer = 0;
  let longPressTimer = 0;
  let suppressClickUntil = 0;
  let startX = 0;
  let startY = 0;
  let isOpen = false;

  const clearOpenTimer = () => {
    if (openTimer && window) window.clearTimeout(openTimer);
    openTimer = 0;
    pendingTrigger = undefined;
  };

  const clearCloseTimer = () => {
    if (closeTimer && window) window.clearTimeout(closeTimer);
    closeTimer = 0;
  };

  const cancelLongPress = () => {
    if (longPressTimer && window) window.clearTimeout(longPressTimer);
    longPressTimer = 0;
  };

  const getContent = (trigger: HTMLElement) => trigger.getAttribute(actionTitleTooltipAttribute) ?? '';

  const ensureSharedTip = () => {
    if (sharedTip) return sharedTip;

    sharedTip = document.createElement('div');
    sharedTip.className = 'm3-tooltip vtt-popover';
    sharedTip.dataset.scope = 'tooltip';
    sharedTip.dataset.part = 'root';
    sharedTip.dataset.variant = 'plain';
    document.body.appendChild(sharedTip);
    return sharedTip;
  };

  const releaseActiveTrigger = () => {
    activeObserver?.disconnect();
    activeObserver = undefined;
    if (isOpen) activeState?.hide();
    activeState?.cleanup();
    activeState = undefined;
    activeTrigger = undefined;
    isOpen = false;
  };

  const activateTrigger = (trigger: HTMLElement) => {
    const content = getContent(trigger);
    if (!content) return undefined;

    const tip = ensureSharedTip();
    tip.textContent = content;

    if (activeTrigger === trigger && activeState) {
      return activeState;
    }

    releaseActiveTrigger();
    activeTrigger = trigger;
    activeState = setupTooltip(
      trigger,
      {
        target: tip,
        content,
        interactive: false,
        placement: 'top',
        popoverType: 'hint',
      },
      { manual: true, triggerAria: 'describedby' },
    );

    activeObserver = new MutationObserver(() => {
      const nextContent = getContent(trigger);
      if (!nextContent) {
        activeState?.hide();
        isOpen = false;
        return;
      }

      tip.textContent = nextContent;
    });
    activeObserver.observe(trigger, { attributes: true, attributeFilter: [actionTitleTooltipAttribute] });
    return activeState;
  };

  const show = (trigger: HTMLElement) => {
    clearOpenTimer();
    clearCloseTimer();
    if (!triggers.has(trigger) || !trigger.isConnected) return;

    const state = activateTrigger(trigger);
    if (!state) return;

    isOpen = true;
    state.show();
  };

  const hide = () => {
    clearOpenTimer();
    clearCloseTimer();
    if (!isOpen) return;

    isOpen = false;
    activeState?.hide();
  };

  const scheduleOpen = (trigger: HTMLElement, delay: number) => {
    clearOpenTimer();
    clearCloseTimer();
    pendingTrigger = trigger;

    if (!window) return;
    openTimer = window.setTimeout(() => {
      openTimer = 0;
      const nextTrigger = pendingTrigger;
      pendingTrigger = undefined;
      if (nextTrigger) show(nextTrigger);
    }, delay);
  };

  const triggerHasOpenReason = (trigger: HTMLElement) => {
    const activeElement = document.activeElement;
    let keyboardFocused = false;
    try {
      keyboardFocused = Boolean(activeElement && trigger.contains(activeElement) && trigger.matches(':focus-visible'));
    } catch {}

    try {
      return trigger.matches(':hover') || keyboardFocused;
    } catch {
      return keyboardFocused;
    }
  };

  const scheduleClose = (trigger: HTMLElement, delay: number) => {
    clearOpenTimer();
    clearCloseTimer();
    if (!window) return;

    closeTimer = window.setTimeout(() => {
      closeTimer = 0;
      if (activeTrigger !== trigger || triggerHasOpenReason(trigger)) return;
      hide();
    }, delay);
  };

  const findTrigger = (event: Event) => {
    for (const item of event.composedPath()) {
      if (item instanceof HTMLElement && triggers.has(item) && item.hasAttribute(actionTitleTooltipAttribute)) {
        return item;
      }
    }

    return undefined;
  };

  const onPointerOver = (event: PointerEvent) => {
    const trigger = findTrigger(event);
    if (!trigger) return;
    const previous = event.relatedTarget;
    if (previous instanceof Node && trigger.contains(previous)) return;
    scheduleOpen(trigger, 60);
  };

  const onPointerOut = (event: PointerEvent) => {
    const trigger = findTrigger(event);
    if (!trigger) return;
    const next = event.relatedTarget;
    if (next instanceof Node && trigger.contains(next)) return;
    scheduleClose(trigger, 80);
  };

  const onFocusIn = (event: FocusEvent) => {
    const trigger = findTrigger(event);
    if (trigger) show(trigger);
  };

  const onFocusOut = (event: FocusEvent) => {
    const trigger = findTrigger(event);
    if (!trigger) return;
    const next = event.relatedTarget;
    if (next instanceof Node && trigger.contains(next)) return;
    scheduleClose(trigger, 0);
  };

  const onPointerDown = (event: PointerEvent) => {
    const trigger = findTrigger(event);

    if (activeTrigger && (!event.target || !activeTrigger.contains(event.target as Node))) {
      hide();
    }

    if (!trigger || event.pointerType !== 'touch' || !window) return;
    startX = event.clientX;
    startY = event.clientY;
    cancelLongPress();
    longPressTimer = window.setTimeout(() => {
      longPressTimer = 0;
      suppressClickUntil = Date.now() + 500;
      show(trigger);
    }, 450);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!longPressTimer || event.pointerType !== 'touch') return;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) cancelLongPress();
  };

  const onPointerUpOrCancel = (event: PointerEvent) => {
    if (event.pointerType === 'touch') cancelLongPress();
  };

  const onClick = (event: MouseEvent) => {
    if (Date.now() >= suppressClickUntil || !findTrigger(event)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const onContextMenu = (event: MouseEvent) => {
    if (isOpen && findTrigger(event) === activeTrigger) event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') hide();
  };

  const on = <T extends Event>(type: string, listener: (event: T) => void, options?: AddEventListenerOptions) => {
    document.addEventListener(type, listener as EventListener, { ...options, signal: abortController.signal });
  };

  on<PointerEvent>('pointerover', onPointerOver);
  on<PointerEvent>('pointerout', onPointerOut);
  on<FocusEvent>('focusin', onFocusIn);
  on<FocusEvent>('focusout', onFocusOut);
  on<PointerEvent>('pointerdown', onPointerDown, { capture: true });
  on<PointerEvent>('pointermove', onPointerMove);
  on<PointerEvent>('pointerup', onPointerUpOrCancel);
  on<PointerEvent>('pointercancel', onPointerUpOrCancel);
  on<MouseEvent>('click', onClick);
  on<MouseEvent>('contextmenu', onContextMenu);
  on<KeyboardEvent>('keydown', onKeyDown);

  const destroy = () => {
    clearOpenTimer();
    clearCloseTimer();
    cancelLongPress();
    abortController.abort();
    releaseActiveTrigger();
    sharedTip?.remove();
    sharedTip = undefined;
    onEmpty();
  };

  return {
    register(trigger) {
      triggers.add(trigger);
      registrationCount += 1;
      let registered = true;

      return () => {
        if (!registered) return;
        registered = false;
        triggers.delete(trigger);
        registrationCount -= 1;

        if (pendingTrigger === trigger) clearOpenTimer();
        if (activeTrigger === trigger) releaseActiveTrigger();
        if (registrationCount === 0) destroy();
      };
    },
  };
}

export function registerActionTitleTooltip(trigger: HTMLElement) {
  const document = trigger.ownerDocument;
  let runtime = runtimes.get(document);

  if (!runtime) {
    runtime = createRuntime(document, () => runtimes.delete(document));
    runtimes.set(document, runtime);
  }

  return runtime.register(trigger);
}
