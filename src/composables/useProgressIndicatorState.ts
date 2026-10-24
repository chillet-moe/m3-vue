import { computed, type Ref } from 'vue';
import { useAnimatedNumber } from '@/composables/useAnimatedNumber';

export type ProgressIndicatorState = 'empty' | 'partial' | 'complete';

export type UseProgressIndicatorStateOptions = {
  element?: Readonly<Ref<Element | null | undefined>>;
  /** Whether the progress value is unknown. */
  indeterminate: () => boolean;

  /** Current progress value. */
  value: () => number;

  /** Minimum progress value. */
  min: () => number;

  /** Maximum progress value. */
  max: () => number;

  /** Explicit accessible value text, if provided. */
  ariaValueText: () => string | undefined;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function useProgressIndicatorState({
  element,
  indeterminate,
  value,
  min,
  max,
  ariaValueText,
}: UseProgressIndicatorStateOptions) {
  const isDeterminate = computed(() => !indeterminate());

  const clampedValue = computed(() => {
    const minValue = min();
    const maxValue = max();
    const currentValue = value();

    if (!Number.isFinite(currentValue)) {
      return minValue;
    }

    if (maxValue <= minValue) {
      return minValue;
    }

    return clamp(currentValue, minValue, maxValue);
  });

  const progressRatio = computed(() => {
    const minValue = min();
    const range = max() - minValue;
    if (!Number.isFinite(range) || range <= 0) {
      return 0;
    }

    return clamp((clampedValue.value - minValue) / range, 0, 1);
  });

  const { displayedValue: progressRatioDisplayed } = useAnimatedNumber(progressRatio, {
    element,
    enabled: isDeterminate,
    clamp: (nextValue) => clamp(nextValue, 0, 1),
  });

  const progressPercent = computed(() => progressRatio.value * 100);

  const progressState = computed<ProgressIndicatorState>(() => {
    if (progressRatioDisplayed.value <= 0) {
      return 'empty';
    }

    if (progressRatioDisplayed.value >= 1) {
      return 'complete';
    }

    return 'partial';
  });

  const ariaValueTextResolved = computed(() => {
    if (!isDeterminate.value) {
      return ariaValueText();
    }

    return ariaValueText() ?? `${Math.round(progressPercent.value)}%`;
  });

  return {
    isDeterminate,
    clampedValue,
    progressRatio,
    progressRatioDisplayed,
    progressPercent,
    progressState,
    ariaValueTextResolved,
  };
}
