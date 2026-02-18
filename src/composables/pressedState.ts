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

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const trySetCapture = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement | null;
    if (!target?.setPointerCapture) return;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // Ignore capture failures; we still handle timers and state.
    }
  };

  const tryReleaseCapture = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLElement | null;
    if (!target?.releasePointerCapture) return;
    try {
      target.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore release failures.
    }
  };

  const shouldHandle = (event: PointerEvent) => {
    return activePointerId === null || event.pointerId === activePointerId;
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
    trySetCapture(event);

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

    isActive = false;
    activePointerId = null;
    tryReleaseCapture(event);

    if (minTimeElapsed) {
      pressed.value = false;
      clearTimer();
    }
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (!shouldHandle(event)) return;

    isActive = false;
    activePointerId = null;
    tryReleaseCapture(event);

    if (minTimeElapsed) {
      pressed.value = false;
      clearTimer();
    }
  };

  const onLostPointerCapture = (event: PointerEvent) => {
    onPointerCancel(event);
  };

  // Cleanup on unmount
  onUnmounted(() => {
    clearTimer();
  });

  return {
    pressed,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
  };
}
