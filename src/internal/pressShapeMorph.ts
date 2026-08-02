export type PressShapeMorphRegistration = {
  disabled: () => boolean;
  enabled: () => boolean;
  minDuration: number;
  setPressed: (pressed: boolean) => void;
};

type ActivePress = {
  element: HTMLElement;
  pointerId: number;
  registration: PressShapeMorphRegistration;
  startedAt: number;
  releaseTimer: number | null;
};

type PressShapeMorphRuntime = {
  register: (element: HTMLElement, registration: PressShapeMorphRegistration) => () => void;
  update: (element: HTMLElement, registration: PressShapeMorphRegistration) => void;
};

const runtimes = new WeakMap<Document, PressShapeMorphRuntime>();

const findRegisteredElement = (
  registrations: WeakMap<HTMLElement, PressShapeMorphRegistration>,
  target: EventTarget | null,
) => {
  let element = target instanceof Element ? target : null;

  while (element) {
    if (element instanceof HTMLElement && registrations.has(element)) return element;
    element = element.parentElement;
  }

  return null;
};

const blockEvent = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
};

const createRuntime = (document: Document): PressShapeMorphRuntime => {
  const registrations = new WeakMap<HTMLElement, PressShapeMorphRegistration>();
  let registrationCount = 0;
  let activePress: ActivePress | null = null;
  let abortController: AbortController | null = null;
  let activeAbortController: AbortController | null = null;
  const view = document.defaultView;
  const now = () => view?.performance.now() ?? performance.now();
  const createAbortController = () => new (view?.AbortController ?? AbortController)();

  const clearReleaseTimer = (press: ActivePress) => {
    if (press.releaseTimer === null) return;
    view?.clearTimeout(press.releaseTimer);
    press.releaseTimer = null;
  };

  const setPressed = (press: ActivePress, pressed: boolean) => {
    press.registration.setPressed(pressed);
    press.element.dataset.pressed = pressed ? 'true' : 'false';
  };

  const finishActivePress = () => {
    const press = activePress;
    if (!press) return;

    activePress = null;
    activeAbortController?.abort();
    activeAbortController = null;
    const remaining = press.registration.minDuration - (now() - press.startedAt);
    if (remaining <= 0) {
      setPressed(press, false);
      return;
    }

    clearReleaseTimer(press);
    press.releaseTimer = (view ?? window).setTimeout(() => {
      press.releaseTimer = null;
      setPressed(press, false);
    }, remaining);
  };

  const cancelActivePress = () => {
    const press = activePress;
    if (!press) return;

    activePress = null;
    activeAbortController?.abort();
    activeAbortController = null;
    clearReleaseTimer(press);
    setPressed(press, false);
  };

  const handlePointerDown = (event: PointerEvent) => {
    const element = findRegisteredElement(registrations, event.target);
    if (!element) return;

    const registration = registrations.get(element)!;
    if (registration.disabled()) {
      blockEvent(event);
      return;
    }
    if (!registration.enabled()) return;
    if (activePress && activePress.pointerId !== event.pointerId) return;

    cancelActivePress();
    activePress = {
      element,
      pointerId: event.pointerId,
      registration,
      startedAt: now(),
      releaseTimer: null,
    };
    setPressed(activePress, true);

    activeAbortController = createAbortController();
    view?.addEventListener('pointerup', handlePointerEnd, { signal: activeAbortController.signal });
    view?.addEventListener('pointercancel', handlePointerEnd, { signal: activeAbortController.signal });
    view?.addEventListener('blur', cancelActivePress, { signal: activeAbortController.signal });
  };

  const handlePointerEnd = (event: PointerEvent) => {
    const element = findRegisteredElement(registrations, event.target);
    const registration = element ? registrations.get(element) : undefined;
    if (registration?.disabled()) blockEvent(event);

    if (activePress?.pointerId === event.pointerId) finishActivePress();
  };

  const handleClick = (event: MouseEvent) => {
    const element = findRegisteredElement(registrations, event.target);
    if (element && registrations.get(element)?.disabled()) blockEvent(event);
  };

  const ensureListeners = () => {
    if (abortController) return;

    abortController = createAbortController();
    const options = { capture: true, signal: abortController.signal };
    document.addEventListener('pointerdown', handlePointerDown, options);
    document.addEventListener('pointerup', handlePointerEnd, options);
    document.addEventListener('pointercancel', handlePointerEnd, options);
    document.addEventListener('click', handleClick, options);
  };

  const removeListeners = () => {
    if (registrationCount !== 0) return;
    cancelActivePress();
    abortController?.abort();
    abortController = null;
  };

  return {
    register(element, registration) {
      if (!registrations.has(element)) registrationCount += 1;
      registrations.set(element, registration);
      ensureListeners();

      return () => {
        if (!registrations.delete(element)) return;
        registrationCount -= 1;
        if (activePress?.element === element) cancelActivePress();
        removeListeners();
      };
    },
    update(element, registration) {
      if (!registrations.has(element)) return;
      registrations.set(element, registration);

      if (activePress?.element === element) {
        activePress.registration = registration;
        if (!registration.enabled() || registration.disabled()) cancelActivePress();
      }
    },
  };
};

export const getPressShapeMorphRuntime = (document: Document) => {
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document);
    runtimes.set(document, runtime);
  }
  return runtime;
};
