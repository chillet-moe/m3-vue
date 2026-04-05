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

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const shouldHandle = (event: PointerEvent) => {
    return activePointerId !== null && event.pointerId === activePointerId;
  };

  const removeWindowListeners = () => {
    if (!hasWindowListeners || typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('pointerup', onWindowPointerUp);
    window.removeEventListener('pointercancel', onWindowPointerCancel);
    window.removeEventListener('blur', onWindowBlur);
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
    if (hasWindowListeners || typeof window === 'undefined') {
      return;
    }

    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerCancel);
    window.addEventListener('blur', onWindowBlur);
    hasWindowListeners = true;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (isActive && activePointerId !== null && event.pointerId !== activePointerId) {
      return;
    }

    pressed.value = true;
    isActive = true;
    minTimeElapsed = false;
    activePointerId = event.pointerId;

    clearTimer();
    addWindowListeners();

    timeoutId = window.setTimeout(() => {
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
  });

  return {
    pressed,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  };
}
