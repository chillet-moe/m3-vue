import { normalizeBinding } from '@/directives/Tooltip/helpers';
import { setupTooltip } from '@/directives/Tooltip/setup';
import type { NormalizedTooltipOptions, TooltipBindingValue } from '@/directives/Tooltip/types';

export type SharedPlainTooltipState = {
  cleanup: () => void;
  update: (binding: TooltipBindingValue) => void;
};

type Registration = {
  opts: NormalizedTooltipOptions;
};

type Runtime = {
  register: (trigger: HTMLElement, binding: TooltipBindingValue) => SharedPlainTooltipState;
};

const runtimes = new WeakMap<Document, Runtime>();

const normalizePlainBinding = (binding: TooltipBindingValue): NormalizedTooltipOptions => ({
  ...normalizeBinding(binding),
  interactive: false,
  target: undefined,
  variant: 'plain',
});

function createRuntime(document: Document, onEmpty: () => void): Runtime {
  const view = document.defaultView;
  const registrations = new Map<HTMLElement, Registration>();
  const abortController = new (view?.AbortController ?? AbortController)();
  let sharedTip: HTMLElement | undefined;
  let activeTrigger: HTMLElement | undefined;
  let activeRegistration: Registration | undefined;
  let activeState: ReturnType<typeof setupTooltip> | undefined;
  let pendingTrigger: HTMLElement | undefined;
  let openTimer = 0;
  let closeTimer = 0;
  let longPressTimer = 0;
  let suppressClickUntil = 0;
  let startX = 0;
  let startY = 0;
  let isOpen = false;

  const clearOpenTimer = () => {
    if (openTimer && view) view.clearTimeout(openTimer);
    openTimer = 0;
    pendingTrigger = undefined;
  };

  const clearCloseTimer = () => {
    if (closeTimer && view) view.clearTimeout(closeTimer);
    closeTimer = 0;
  };

  const cancelLongPress = () => {
    if (longPressTimer && view) view.clearTimeout(longPressTimer);
    longPressTimer = 0;
  };

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
    if (isOpen) activeState?.hide();
    activeState?.cleanup();
    activeState = undefined;
    activeRegistration = undefined;
    activeTrigger = undefined;
    isOpen = false;
  };

  const activateTrigger = (trigger: HTMLElement) => {
    const registration = registrations.get(trigger);
    if (!registration?.opts.content) return undefined;

    if (activeTrigger === trigger && activeRegistration === registration && activeState) return activeState;

    releaseActiveTrigger();
    const tip = ensureSharedTip();
    tip.textContent = registration.opts.content;
    activeTrigger = trigger;
    activeRegistration = registration;
    activeState = setupTooltip(
      trigger,
      { ...registration.opts, target: tip },
      { manual: true, triggerAria: registration.opts.triggerAria },
    );
    return activeState;
  };

  const show = (trigger: HTMLElement) => {
    clearOpenTimer();
    clearCloseTimer();
    if (!registrations.has(trigger) || !trigger.isConnected) return;

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

  const scheduleOpen = (trigger: HTMLElement) => {
    const registration = registrations.get(trigger);
    if (!registration || !view) return;

    clearOpenTimer();
    clearCloseTimer();
    pendingTrigger = trigger;
    openTimer = view.setTimeout(() => {
      openTimer = 0;
      const nextTrigger = pendingTrigger;
      pendingTrigger = undefined;
      if (nextTrigger) show(nextTrigger);
    }, registration.opts.openDelay);
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

  const scheduleClose = (trigger: HTMLElement) => {
    const registration = registrations.get(trigger);
    if (!registration || !view) return;

    clearOpenTimer();
    clearCloseTimer();
    closeTimer = view.setTimeout(() => {
      closeTimer = 0;
      if (activeTrigger !== trigger || triggerHasOpenReason(trigger)) return;
      hide();
    }, registration.opts.closeDelay);
  };

  const findTrigger = (event: Event) => {
    for (const item of event.composedPath()) {
      if (item instanceof HTMLElement && registrations.has(item)) return item;
    }
    return undefined;
  };

  const onPointerOver = (event: PointerEvent) => {
    const trigger = findTrigger(event);
    if (!trigger) return;
    if (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget)) return;
    scheduleOpen(trigger);
  };

  const onPointerOut = (event: PointerEvent) => {
    const trigger = findTrigger(event);
    if (!trigger) return;
    if (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget)) return;
    scheduleClose(trigger);
  };

  const onFocusIn = (event: FocusEvent) => {
    const trigger = findTrigger(event);
    if (trigger) show(trigger);
  };

  const onFocusOut = (event: FocusEvent) => {
    const trigger = findTrigger(event);
    if (!trigger) return;
    if (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget)) return;
    scheduleClose(trigger);
  };

  const onPointerDown = (event: PointerEvent) => {
    const trigger = findTrigger(event);
    if (activeTrigger && (!event.target || !activeTrigger.contains(event.target as Node))) hide();
    if (!trigger || event.pointerType !== 'touch' || !view) return;

    startX = event.clientX;
    startY = event.clientY;
    cancelLongPress();
    longPressTimer = view.setTimeout(() => {
      longPressTimer = 0;
      suppressClickUntil = Date.now() + 500;
      show(trigger);
    }, registrations.get(trigger)!.opts.longpressDelay);
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
    register(trigger, binding) {
      const registration = { opts: normalizePlainBinding(binding) };
      registrations.set(trigger, registration);
      let registered = true;

      return {
        cleanup() {
          if (!registered) return;
          registered = false;
          registrations.delete(trigger);
          if (pendingTrigger === trigger) clearOpenTimer();
          if (activeTrigger === trigger) releaseActiveTrigger();
          if (registrations.size === 0) destroy();
        },
        update(nextBinding) {
          if (!registered) return;
          const previousTriggerAria = registration.opts.triggerAria;
          registration.opts = normalizePlainBinding(nextBinding);

          if (activeTrigger !== trigger) return;
          if (!registration.opts.content || registration.opts.triggerAria !== previousTriggerAria) {
            const shouldReopen = isOpen && Boolean(registration.opts.content);
            releaseActiveTrigger();
            if (shouldReopen) show(trigger);
            return;
          }

          const tip = ensureSharedTip();
          tip.textContent = registration.opts.content;
          activeState?.update({ ...registration.opts, target: tip });
        },
      };
    },
  };
}

export function registerSharedPlainTooltip(trigger: HTMLElement, binding: TooltipBindingValue) {
  const document = trigger.ownerDocument;
  let runtime = runtimes.get(document);

  if (!runtime) {
    runtime = createRuntime(document, () => runtimes.delete(document));
    runtimes.set(document, runtime);
  }

  return runtime.register(trigger, binding);
}
