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

  const onPointerDown = () => {
    pressed.value = true;
    isActive = true;
    minTimeElapsed = false;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      minTimeElapsed = true;
      if (!isActive) {
        pressed.value = false;
      }
      timeoutId = null;
    }, minDuration);
  };

  const onPointerUp = () => {
    isActive = false;
    if (minTimeElapsed) {
      pressed.value = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  };

  const onPointerCancel = () => {
    onPointerUp();
  };

  // Cleanup on unmount
  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  });

  return {
    pressed,
    onPointerDown,
    onPointerUp,
    onPointerCancel
  };
}

