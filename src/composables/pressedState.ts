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
  let minTimeElapsed = false;
  let isActive = false;
  let activePointerId: number | null = null;
  let hasWindowListeners = false;
  let view: Window | null = null;
  let releaseEnvironment: (() => void) | undefined;

  const clearTimer = () => {
    if (timeoutId) {
      view?.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const shouldHandle = (event: PointerEvent) => {
    return activePointerId !== null && event.pointerId === activePointerId;
  };

  const removeWindowListeners = () => {
    if (!hasWindowListeners || !view) {
      return;
    }

    view!.removeEventListener('pointerup', onWindowPointerUp);
    view!.removeEventListener('pointercancel', onWindowPointerCancel);
    view!.removeEventListener('blur', onWindowBlur);
    hasWindowListeners = false;
  };

  const finishInteraction = () => {
    isActive = false;
    activePointerId = null;
    removeWindowListeners();

    if (minTimeElapsed) {
      pressed.value = false;
      clearTimer();
    }
  };

  function onWindowPointerUp(event: PointerEvent) {
    onPointerUp(event);
  }

  function onWindowPointerCancel(event: PointerEvent) {
    onPointerCancel(event);
  }

  function onWindowBlur() {
    if (!isActive) return;
    finishInteraction();
  }

  const addWindowListeners = () => {
    if (hasWindowListeners || !view) {
      return;
    }

    view!.addEventListener('pointerup', onWindowPointerUp);
    view!.addEventListener('pointercancel', onWindowPointerCancel);
    view!.addEventListener('blur', onWindowBlur);
    hasWindowListeners = true;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (isActive && activePointerId !== null && event.pointerId !== activePointerId) {
      return;
    }

    releaseEnvironment?.();
    view =
      (event.currentTarget as Node | null)?.ownerDocument?.defaultView ??
      (event.target as Node | null)?.ownerDocument?.defaultView ??
      window;
    const element = event.currentTarget ?? event.target;
    if (isElement(element))
      releaseEnvironment = bindElementEnvironment(element, () => () => {
        clearTimer();
        removeWindowListeners();
        pressed.value = false;
        isActive = false;
        activePointerId = null;
      });
    pressed.value = true;
    isActive = true;
    minTimeElapsed = false;
    activePointerId = event.pointerId;

    clearTimer();
    addWindowListeners();

    timeoutId = view!.setTimeout(() => {
      minTimeElapsed = true;
      if (!isActive) {
        pressed.value = false;
        activePointerId = null;
      }
      timeoutId = null;
    }, minDuration);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!shouldHandle(event)) return;

    finishInteraction();
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (!shouldHandle(event)) return;

    finishInteraction();
  };

  // Cleanup on unmount
  onUnmounted(() => {
    clearTimer();
    removeWindowListeners();
    releaseEnvironment?.();
  });

  return {
    pressed,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  };
}
