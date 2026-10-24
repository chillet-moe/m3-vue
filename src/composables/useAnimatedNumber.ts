import { useElementEnvironment } from '@/internal/elementEnvironment';
import { onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';

export type UseAnimatedNumberOptions = {
  element?: Readonly<Ref<Element | null | undefined>>;
  enabled?: MaybeRefOrGetter<boolean>;
  clamp?: (value: number) => number;
  stiffness?: MaybeRefOrGetter<number>;
  damping?: MaybeRefOrGetter<number>;
  settleDistance?: number;
  settleVelocity?: number;
  maxStepSeconds?: number;
  initialFrameSeconds?: number;
  onUpdate?: () => void;
};

export type UseAnimatedNumberReturn = {
  displayedValue: Ref<number>;
  startAnimation: () => void;
  stopAnimation: () => void;
  syncToTarget: () => void;
};

const defaultClamp = (value: number) => value;

export function useAnimatedNumber(
  target: MaybeRefOrGetter<number>,
  options: UseAnimatedNumberOptions = {},
): UseAnimatedNumberReturn {
  const clampValue = options.clamp ?? defaultClamp;
  const getTargetValue = () => clampValue(toValue(target));
  const isEnabled = () => options.enabled === undefined || Boolean(toValue(options.enabled));

  const displayedValue = ref(getTargetValue());
  let view = options.element?.value?.ownerDocument.defaultView ?? (typeof window !== 'undefined' ? window : null);
  let animationFrame = 0;
  let animationTime: number | undefined;
  let velocity = 0;

  const settleDistance = options.settleDistance ?? 0.0005;
  const settleVelocity = options.settleVelocity ?? 0.0005;
  const maxStepSeconds = options.maxStepSeconds ?? 1 / 120;
  const initialFrameSeconds = options.initialFrameSeconds ?? 1 / 60;

  const stopAnimation = () => {
    if (animationFrame && view) {
      view!.cancelAnimationFrame(animationFrame);
    }
    animationFrame = 0;
    animationTime = undefined;
  };

  const setDisplayedValue = (value: number) => {
    displayedValue.value = clampValue(value);
    options.onUpdate?.();
  };

  const syncToTarget = () => {
    stopAnimation();
    velocity = 0;
    setDisplayedValue(getTargetValue());
  };

  const animationStep = (timestamp: number) => {
    if (animationTime === undefined) {
      animationTime = timestamp - initialFrameSeconds * 1000;
    }

    let remainingSeconds = Math.min(Math.max((timestamp - animationTime) / 1000, 0), 0.05);
    animationTime = timestamp;

    while (remainingSeconds > 0) {
      const deltaSeconds = Math.min(remainingSeconds, maxStepSeconds);
      const targetValue = getTargetValue();
      const stiffness = options.stiffness === undefined ? 420 : toValue(options.stiffness);
      const damping = options.damping === undefined ? 36 : toValue(options.damping);
      const distance = targetValue - displayedValue.value;
      const acceleration = distance * stiffness - velocity * damping;

      velocity += acceleration * deltaSeconds;

      const nextValue = displayedValue.value + velocity * deltaSeconds;
      const clampedValue = clampValue(nextValue);
      if (clampedValue !== nextValue) {
        velocity = 0;
      }
      displayedValue.value = clampedValue;
      remainingSeconds -= deltaSeconds;
    }

    options.onUpdate?.();

    const targetValue = getTargetValue();
    if (Math.abs(targetValue - displayedValue.value) <= settleDistance && Math.abs(velocity) <= settleVelocity) {
      syncToTarget();
      return;
    }

    animationFrame = view!.requestAnimationFrame(animationStep);
  };

  const startAnimation = () => {
    if (!view || !isEnabled()) {
      syncToTarget();
      return;
    }

    const targetValue = getTargetValue();
    if (Math.abs(targetValue - displayedValue.value) <= settleDistance && velocity === 0) {
      setDisplayedValue(targetValue);
      return;
    }

    if (!animationFrame) {
      animationTime = undefined;
      animationFrame = view!.requestAnimationFrame(animationStep);
    }
  };

  watch(
    () => [getTargetValue(), isEnabled()] as const,
    ([, enabled]) => {
      if (!enabled) {
        syncToTarget();
        return;
      }

      startAnimation();
    },
    { flush: 'sync' },
  );

  if (options.element)
    useElementEnvironment(options.element, (document) => {
      view = document.defaultView;
      startAnimation();
      return () => {
        stopAnimation();
        view = null;
      };
    });

  onBeforeUnmount(() => {
    stopAnimation();
  });

  return {
    displayedValue,
    startAnimation,
    stopAnimation,
    syncToTarget,
  };
}
