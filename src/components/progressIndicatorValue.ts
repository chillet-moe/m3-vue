import { onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

const PROGRESS_DISPLAY_SETTLE_DISTANCE = 0.0005;
const PROGRESS_DISPLAY_SETTLE_VELOCITY = 0.0005;
const PROGRESS_DISPLAY_STIFFNESS = 420;
const PROGRESS_DISPLAY_DAMPING = 36;

export function useProgressDisplayedValue(target: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean>) {
  const displayedValue = ref(toValue(target));
  let animationFrame = 0;
  let animationTime = 0;
  let velocity = 0;

  const stopAnimation = () => {
    if (animationFrame && typeof window !== 'undefined') {
      window.cancelAnimationFrame(animationFrame);
    }
    animationFrame = 0;
    animationTime = 0;
  };

  const finishAnimation = () => {
    stopAnimation();
    displayedValue.value = toValue(target);
    velocity = 0;
  };

  const animationStep = (timestamp: number) => {
    if (!animationTime) {
      animationTime = timestamp;
      animationFrame = window.requestAnimationFrame(animationStep);
      return;
    }

    const deltaSeconds = Math.min((timestamp - animationTime) / 1000, 0.05);
    animationTime = timestamp;

    const targetValue = toValue(target);
    const distance = targetValue - displayedValue.value;
    const acceleration = distance * PROGRESS_DISPLAY_STIFFNESS - velocity * PROGRESS_DISPLAY_DAMPING;

    velocity += acceleration * deltaSeconds;
    displayedValue.value += velocity * deltaSeconds;

    if (
      Math.abs(targetValue - displayedValue.value) <= PROGRESS_DISPLAY_SETTLE_DISTANCE &&
      Math.abs(velocity) <= PROGRESS_DISPLAY_SETTLE_VELOCITY
    ) {
      finishAnimation();
      return;
    }

    animationFrame = window.requestAnimationFrame(animationStep);
  };

  const startAnimation = () => {
    if (typeof window === 'undefined' || !toValue(enabled)) {
      finishAnimation();
      return;
    }

    const targetValue = toValue(target);
    if (Math.abs(targetValue - displayedValue.value) <= PROGRESS_DISPLAY_SETTLE_DISTANCE && velocity === 0) {
      displayedValue.value = targetValue;
      return;
    }

    if (!animationFrame) {
      animationTime = 0;
      animationFrame = window.requestAnimationFrame(animationStep);
    }
  };

  watch(
    () => [toValue(target), toValue(enabled)] as const,
    ([, isEnabled]) => {
      if (!isEnabled) {
        finishAnimation();
        return;
      }

      startAnimation();
    },
    { flush: 'sync' },
  );

  onBeforeUnmount(() => {
    stopAnimation();
  });

  return displayedValue;
}
