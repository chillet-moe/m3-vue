import { bindElementEnvironment, isElement } from '@/internal/elementEnvironment';
import { ref, onUnmounted } from 'vue';

/**
 * Composable for managing a pressed state that is removed after a minimum duration
 * and when the element is no longer active
 *
 * @param minDuration - Minimum duration in milliseconds before the pressed state can be removed (default: 200ms)
 * @returns Object containing the pressed state and event handlers
 */
export function usePressedState(minDuration = 200) {
  const pressed = ref(false);
  let timeoutId: number | null = null;
  let activePointerId: number | null = null;
  let view: Window | null = null;
  let releaseEnvironment: (() => void) | undefined;

  const clearTimer = () => {
    if (timeoutId !== null) {
      view?.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const releasePointer = () => {
    if (activePointerId === null) return;

    activePointerId = null;
    view?.removeEventListener('pointerup', onPointerEnd);
    view?.removeEventListener('pointercancel', onPointerEnd);
    view?.removeEventListener('blur', onWindowBlur);
  };

  const resetPress = () => {
    clearTimer();
    releasePointer();
    view = null;
    pressed.value = false;
  };

  const releasePress = () => {
    if (releaseEnvironment) releaseEnvironment();
    else resetPress();
  };

  const finishInteraction = () => {
    releasePointer();
    if (timeoutId === null) releasePress();
  };

  function onPointerEnd(event: PointerEvent) {
    if (activePointerId !== null && event.pointerId === activePointerId) finishInteraction();
  }

  function onWindowBlur() {
    if (activePointerId === null) return;
    finishInteraction();
  }

  const onPointerDown = (event: PointerEvent) => {
    if (activePointerId !== null && event.pointerId !== activePointerId) {
      return;
    }

    if (releaseEnvironment) releaseEnvironment();
    else {
      clearTimer();
      releasePointer();
    }

    const eventView =
      (event.currentTarget as Node | null)?.ownerDocument?.defaultView ??
      (event.target as Node | null)?.ownerDocument?.defaultView ??
      window;
    view = eventView;

    const element = event.currentTarget ?? event.target;
    if (isElement(element)) {
      const document = element.ownerDocument;
      const unbind = bindElementEnvironment(element, (owner) => {
        if (owner !== document) {
          // Adoption cancels the press. Release once the environment has finished rebinding.
          queueMicrotask(unbind);
          return;
        }

        return () => {
          if (releaseEnvironment !== unbind) return;
          releaseEnvironment = undefined;
          resetPress();
        };
      });
      releaseEnvironment = unbind;
    }

    activePointerId = event.pointerId;
    eventView.addEventListener('pointerup', onPointerEnd);
    eventView.addEventListener('pointercancel', onPointerEnd);
    eventView.addEventListener('blur', onWindowBlur);
    timeoutId = eventView.setTimeout(() => {
      timeoutId = null;
      if (activePointerId === null) releasePress();
    }, minDuration);
    pressed.value = true;
  };

  onUnmounted(releasePress);

  return {
    pressed,
    onPointerDown,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };
}
