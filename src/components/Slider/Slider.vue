<script setup lang="ts">
import { useElementEnvironment } from '@/internal/elementEnvironment';
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  useAttrs,
  useId,
  useTemplateRef,
  watch,
} from 'vue';
import { sliderContextKey } from './SliderContext';
import { useAnimatedNumber } from '@/composables/useAnimatedNumber';
import { Icon } from '@/components/Icon';

export type SliderProps = {
  /** Whether the slider is vertical. */
  vertical?: boolean;

  /** The direction of the slider. */
  direction?: 'ltr' | 'rtl';

  /** The minimum value of the slider. */
  min: number;

  /** The maximum value of the slider. */
  max: number;

  /** The step value of the slider. */
  step: number;

  /** Enable mouse-wheel value changes. Disabled by default to preserve page scrolling. */
  wheel?: boolean;

  /** The amount the value changes when wheel interaction is enabled. */
  wheelStep?: number;

  /** The lower limit for the slider value. */
  lowerLimit?: number;

  /** The upper limit for the slider value. */
  upperLimit?: number;

  /** Visual appearance, independent of size. */
  appearance?: 'standard' | 'expressive';

  /** The size of the slider. */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

  /** Name of the inset icon shown at the start side of the track. */
  startIcon?: string;

  /** Name of the inset icon shown at the end side of the track. */
  endIcon?: string;

  disabled?: boolean;
  valueIndicator?: boolean;
  valueIndicatorPlacement?: 'top' | 'bottom' | 'start' | 'end';
  formatter?: {
    valueToText: (value: number) => string;
    textToValue: (text?: string) => number | undefined;
  };
  stopIndicators?: number[];
};

const {
  vertical = false,
  direction = 'ltr',
  size: sizeProp,
  appearance: appearanceProp,
  min,
  max,
  step,
  disabled = false,
  lowerLimit,
  upperLimit,
  wheel = false,
  wheelStep,
  startIcon,
  endIcon,
  valueIndicator = true,
  valueIndicatorPlacement: valueIndicatorPlacementProp,
  formatter,
  stopIndicators,
} = defineProps<SliderProps>();

const attrs = useAttrs();
const defaults = inject(sliderContextKey, undefined);
const appearance = computed(() => appearanceProp ?? unref(defaults?.appearance) ?? 'standard');
const size = computed(() => sizeProp ?? unref(defaults?.size) ?? 'medium');

const valueIndicatorPlacement = computed(() => {
  return valueIndicatorPlacementProp ?? (vertical ? 'end' : 'top');
});

const value = defineModel<number>('value', { required: true });

const clampPercent = (percent: number) => {
  if (!Number.isFinite(percent)) {
    return 0;
  } else if (percent < 0) {
    return 0;
  } else if (percent > 1) {
    return 1;
  } else {
    return percent;
  }
};

const getValuePercent = (currentValue: number) => {
  const range = max - min;
  if (!Number.isFinite(currentValue) || !Number.isFinite(min) || !Number.isFinite(max) || range <= 0) {
    return 0;
  }

  return clampPercent((currentValue - min) / range);
};

const valueCurrent = ref(value.value);
const valuePercent = computed(() => getValuePercent(valueCurrent.value));
const valueText = computed(() => {
  return formatter ? formatter.valueToText(valueCurrent.value) : valueCurrent.value;
});

const supportsInsetIcon = computed(
  () => appearance.value === 'expressive' && ['medium', 'large', 'extra-large'].includes(size.value),
);
const hasStartInsetIcon = computed(() => supportsInsetIcon.value && Boolean(startIcon));
const hasEndInsetIcon = computed(() => supportsInsetIcon.value && Boolean(endIcon));
const hasInsetIcon = computed(() => hasStartInsetIcon.value || hasEndInsetIcon.value);
const insetIconPopThreshold = computed(() => {
  switch (size.value) {
    default:
    case 'large':
    case 'medium':
      return 40;
    case 'extra-large':
      return 56;
  }
});
const startInsetIconName = computed(() => startIcon ?? '');
const endInsetIconName = computed(() => endIcon ?? '');

// Native range inputs derive their step grid from min and discard an off-grid max. Keep the input
// continuous and normalize values here so effective limits and shortened final intervals stay selectable.
const valueMinimum = computed(() => Math.min(max, Math.max(min, lowerLimit ?? min)));
const valueMaximum = computed(() => Math.max(valueMinimum.value, Math.max(min, Math.min(max, upperLimit ?? max))));
const isValidStep = (valueStep: number) => Number.isFinite(valueStep) && valueStep > 0;
const hasValidStep = computed(() => isValidStep(step));

const normalizeValuePrecision = (nextValue: number) => {
  const normalizedValue = Number(nextValue.toPrecision(15));
  return Object.is(normalizedValue, -0) ? 0 : normalizedValue;
};

const clampValue = (nextValue: number) => {
  if (nextValue < valueMinimum.value) {
    return [true, valueMinimum.value] as const;
  } else if (nextValue > valueMaximum.value) {
    return [true, valueMaximum.value] as const;
  }
  return [false, nextValue] as const;
};

const snapValueToStep = (nextValue: number) => {
  const [, clampedValue] = clampValue(nextValue);
  if (!hasValidStep.value || valueMinimum.value === valueMaximum.value) {
    return clampedValue;
  }

  const stepIndex = Math.round((clampedValue - valueMinimum.value) / step);
  const steppedValue = normalizeValuePrecision(valueMinimum.value + stepIndex * step);
  const steppedCandidate = Math.min(valueMaximum.value, Math.max(valueMinimum.value, steppedValue));

  // The upper endpoint is always selectable, even when the final interval is shorter than one step.
  return Math.abs(valueMaximum.value - clampedValue) <= Math.abs(steppedCandidate - clampedValue)
    ? valueMaximum.value
    : steppedCandidate;
};

const getAdjacentStepValue = (currentValue: number, direction: -1 | 1, valueStep: number) => {
  const [, clampedValue] = clampValue(currentValue);
  if (!isValidStep(valueStep) || valueMinimum.value === valueMaximum.value) {
    return clampedValue;
  }

  const stepIndex = (clampedValue - valueMinimum.value) / valueStep;
  const nextStepIndex = direction > 0 ? Math.floor(stepIndex + 1e-10) + 1 : Math.ceil(stepIndex - 1e-10) - 1;
  const steppedValue = normalizeValuePrecision(valueMinimum.value + nextStepIndex * valueStep);
  return Math.min(valueMaximum.value, Math.max(valueMinimum.value, steppedValue));
};

const setValueFromInteraction = (nextValue: number, target: HTMLInputElement) => {
  const normalizedValue = normalizeValuePrecision(nextValue);
  target.value = `${normalizedValue}`;
  valueCurrent.value = normalizedValue;
  value.value = normalizedValue;
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const inputValue = target.valueAsNumber;
  const snappedValue = snapValueToStep(inputValue);

  valueCurrent.value = snappedValue;
  if (isValueDragging.value) {
    syncValueDisplayedToTarget();
  }
  if (snappedValue !== inputValue) {
    event.preventDefault();
    event.stopPropagation();
    target.value = `${snappedValue}`;
  }
};

const onChange = () => {
  value.value = valueCurrent.value;
};

const onWheel = (event: WheelEvent) => {
  if (!wheel || disabled || event.deltaY === 0) {
    return;
  }

  event.preventDefault();
  const dir = event.deltaY < 0 ? 1 : -1;
  const valueStep = event.altKey ? step : (wheelStep ?? step);
  const nextValue = getAdjacentStepValue(valueCurrent.value, dir, valueStep);
  setValueFromInteraction(nextValue, event.currentTarget as HTMLInputElement);
};

const stopIndicatorsFiltered = computed(() => {
  if (!stopIndicators) {
    return undefined;
  }
  return stopIndicators.filter((stop) => stop >= min && stop <= max);
});

const sliderRef = useTemplateRef<HTMLDivElement>('slider');
const inputRef = useTemplateRef<HTMLInputElement>('input');
const valueIndicatorRef = useTemplateRef<HTMLDivElement>('valueIndicator');
const valueIndicatorId = useId();
const isStartInsetIconFlipped = ref(false);
const isEndInsetIconFlipped = ref(false);

const isValueIndicatorHovered = ref(false);
const isValueIndicatorFocused = ref(false);
const isValueIndicatorDragging = ref(false);
const isValueDragging = ref(false);
const isValueIndicatorVisible = computed(
  () =>
    !disabled &&
    valueIndicator &&
    (isValueIndicatorHovered.value || isValueIndicatorFocused.value || isValueIndicatorDragging.value),
);
let syncValueIndicatorFocusFrame = 0;
let activePointerId: number | null = null;
let pointerDownPosition: { x: number; y: number } | null = null;
let sliderResizeObserver: ResizeObserver | null = null;
let isWindowPointerMoveListenerActive = false;
let isWindowPointerEndListenerActive = false;
let isWindowViewportListenerActive = false;

const pointerDragStartDistance = 3;

const isCurrentPointerEvent = (event?: Event) => {
  if (!event) {
    return false;
  }

  if (!('pointerId' in event) || typeof event.pointerId !== 'number') {
    return true;
  }

  return event.pointerId === activePointerId;
};

const supportsValueIndicatorPopover = (element: HTMLElement) => {
  return (
    typeof (element as HTMLElement & { showPopover?: unknown }).showPopover === 'function' &&
    typeof (element as HTMLElement & { hidePopover?: unknown }).hidePopover === 'function'
  );
};

const isValueIndicatorPopoverOpen = (element: HTMLElement) => {
  try {
    return element.matches(':popover-open');
  } catch {
    return false;
  }
};

let sliderWindow: Window | null = null;
const syncValueIndicatorPosition = () => {
  const slider = sliderRef.value;
  const indicator = valueIndicatorRef.value;
  if (!slider || !indicator) {
    return;
  }

  const sliderWindow = slider.ownerDocument.defaultView!;
  const rect = slider.getBoundingClientRect();
  indicator.style.setProperty('--value-indicator-slider-left', `${rect.left}px`);
  indicator.style.setProperty('--value-indicator-slider-right', `${rect.right}px`);
  indicator.style.setProperty('--value-indicator-slider-top', `${rect.top}px`);
  indicator.style.setProperty('--value-indicator-slider-bottom', `${rect.bottom}px`);
  indicator.style.setProperty('--value-indicator-slider-center-x', `${rect.left + rect.width / 2}px`);
  indicator.style.setProperty('--value-indicator-slider-center-y', `${rect.top + rect.height / 2}px`);
  indicator.style.setProperty(
    '--value-indicator-viewport-right',
    `${Math.max(0, sliderWindow!.innerWidth - rect.right)}px`,
  );
  indicator.style.setProperty(
    '--value-indicator-viewport-bottom',
    `${Math.max(0, sliderWindow!.innerHeight - rect.bottom)}px`,
  );
};

const showValueIndicatorPopover = () => {
  const indicator = valueIndicatorRef.value;
  if (!indicator) {
    return;
  }

  syncValueIndicatorPosition();
  if (!supportsValueIndicatorPopover(indicator) || isValueIndicatorPopoverOpen(indicator)) {
    return;
  }

  try {
    (indicator as HTMLElement & { showPopover: () => void }).showPopover();
  } catch {}
};

const hideValueIndicatorPopover = () => {
  const indicator = valueIndicatorRef.value;
  if (!indicator || !supportsValueIndicatorPopover(indicator) || !isValueIndicatorPopoverOpen(indicator)) {
    return;
  }

  try {
    (indicator as HTMLElement & { hidePopover: () => void }).hidePopover();
  } catch {}
};

const syncValueIndicatorPopover = () => {
  if (isValueIndicatorVisible.value) {
    showValueIndicatorPopover();
    return;
  }

  hideValueIndicatorPopover();
};

const syncInsetIconPlacement = () => {
  const slider = sliderRef.value;
  const targetPercent = getValuePercent(valueCurrent.value);

  if (!slider || !hasInsetIcon.value) {
    isStartInsetIconFlipped.value = false;
    isEndInsetIconFlipped.value = false;
    return;
  }

  // Absolute-positioned slider parts are laid out against the root padding box.
  const inlineSize = vertical ? slider.clientHeight : slider.clientWidth;
  if (inlineSize <= 0) {
    isStartInsetIconFlipped.value = false;
    isEndInsetIconFlipped.value = false;
    return;
  }

  if (hasStartInsetIcon.value) {
    isStartInsetIconFlipped.value = inlineSize * targetPercent < insetIconPopThreshold.value;
  } else {
    isStartInsetIconFlipped.value = false;
  }

  if (hasEndInsetIcon.value) {
    isEndInsetIconFlipped.value = inlineSize * (1 - targetPercent) < insetIconPopThreshold.value;
  } else {
    isEndInsetIconFlipped.value = false;
  }
};

const syncValuePresentation = () => {
  syncInsetIconPlacement();
};

const {
  displayedValue: valueDisplayed,
  stopAnimation: stopSyncValueDisplayed,
  syncToTarget: syncValueDisplayedToTarget,
} = useAnimatedNumber(valuePercent, {
  element: sliderRef,
  clamp: clampPercent,
  onUpdate: syncAnimatedValuePresentation,
});

let valueDisplayedStyleElements: HTMLElement[] = [];

function syncValueDisplayedStyle() {
  const percent = `${valueDisplayed.value}`;
  for (const element of valueDisplayedStyleElements) {
    element.style.setProperty('--percent', percent);
  }
}

function syncAnimatedValuePresentation() {
  syncValueDisplayedStyle();
}

const refreshValueDisplayedStyleElements = () => {
  const slider = sliderRef.value;
  valueDisplayedStyleElements = slider
    ? [...slider.querySelectorAll<HTMLElement>('[data-slider-percent-target="true"]')]
    : [];
  syncValueDisplayedStyle();
};

const syncValueIndicatorHoveredState = (event?: MouseEvent | PointerEvent) => {
  const input = inputRef.value;
  if (!input) {
    isValueIndicatorHovered.value = false;
    return;
  }

  if (event && 'clientX' in event && 'clientY' in event) {
    const { top, right, bottom, left } = input.getBoundingClientRect();
    isValueIndicatorHovered.value =
      event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
    return;
  }

  isValueIndicatorHovered.value = input.matches(':hover');
};

const syncValueIndicatorFocusedState = () => {
  const input = inputRef.value;
  isValueIndicatorFocused.value = !disabled && Boolean(input?.matches(':focus-visible'));
};

const scheduleSyncValueIndicatorFocusedState = () => {
  if (syncValueIndicatorFocusFrame) {
    sliderWindow!.cancelAnimationFrame(syncValueIndicatorFocusFrame);
  }

  syncValueIndicatorFocusFrame = sliderWindow!.requestAnimationFrame(() => {
    syncValueIndicatorFocusFrame = 0;
    syncValueIndicatorFocusedState();
  });
};

const stopValueIndicatorDragging = (event?: Event) => {
  if (isValueIndicatorDragging.value) {
    isValueIndicatorDragging.value = false;
    if (event && 'clientX' in event && 'clientY' in event) {
      syncValueIndicatorHoveredState(event as MouseEvent | PointerEvent);
    }
  }

  if (isCurrentPointerEvent(event)) {
    isValueDragging.value = false;
    activePointerId = null;
    pointerDownPosition = null;
  }

  syncWindowPointerListeners();
};

const onWindowPointerMove = (event: PointerEvent) => {
  if (!isValueIndicatorDragging.value && isValueIndicatorHovered.value) {
    syncValueIndicatorHoveredState(event);
  }

  if (event.pointerId !== activePointerId || !pointerDownPosition || isValueDragging.value) {
    syncWindowPointerListeners();
    return;
  }

  const diffX = event.clientX - pointerDownPosition.x;
  const diffY = event.clientY - pointerDownPosition.y;
  if (diffX * diffX + diffY * diffY < pointerDragStartDistance * pointerDragStartDistance) {
    syncWindowPointerListeners();
    return;
  }

  isValueDragging.value = true;
  syncWindowPointerListeners();
};

const shouldListenToWindowPointerMove = () => {
  return (
    (!disabled && valueIndicator && isValueIndicatorHovered.value) ||
    isValueIndicatorDragging.value ||
    activePointerId !== null ||
    pointerDownPosition !== null
  );
};

const shouldListenToWindowPointerEnd = () => {
  return isValueIndicatorDragging.value || activePointerId !== null || pointerDownPosition !== null;
};

function syncWindowPointerListeners() {
  if (!sliderWindow || sliderWindow.closed) return;
  const shouldListenPointerMove = shouldListenToWindowPointerMove();
  if (shouldListenPointerMove && !isWindowPointerMoveListenerActive) {
    sliderWindow!.addEventListener('pointermove', onWindowPointerMove);
    isWindowPointerMoveListenerActive = true;
  } else if (!shouldListenPointerMove && isWindowPointerMoveListenerActive) {
    sliderWindow!.removeEventListener('pointermove', onWindowPointerMove);
    isWindowPointerMoveListenerActive = false;
  }

  const shouldListenPointerEnd = shouldListenToWindowPointerEnd();
  if (shouldListenPointerEnd && !isWindowPointerEndListenerActive) {
    sliderWindow!.addEventListener('pointerup', stopValueIndicatorDragging);
    sliderWindow!.addEventListener('pointercancel', stopValueIndicatorDragging);
    isWindowPointerEndListenerActive = true;
  } else if (!shouldListenPointerEnd && isWindowPointerEndListenerActive) {
    sliderWindow!.removeEventListener('pointerup', stopValueIndicatorDragging);
    sliderWindow!.removeEventListener('pointercancel', stopValueIndicatorDragging);
    isWindowPointerEndListenerActive = false;
  }
}

const onValueIndicatorPointerEnter = () => {
  if (disabled) {
    return;
  }

  isValueIndicatorHovered.value = true;
  syncWindowPointerListeners();
};

const onValueIndicatorPointerLeave = () => {
  isValueIndicatorHovered.value = false;
  syncWindowPointerListeners();
};

const onValueIndicatorFocus = () => {
  if (disabled) {
    return;
  }

  syncValueIndicatorFocusedState();
};

const onValueIndicatorBlur = () => {
  isValueIndicatorFocused.value = false;
};

const onValueIndicatorPointerDown = (event: PointerEvent) => {
  if (disabled) {
    return;
  }

  isValueIndicatorFocused.value = false;
  isValueIndicatorDragging.value = true;
  isValueDragging.value = false;
  activePointerId = 'pointerId' in event && typeof event.pointerId === 'number' ? event.pointerId : null;
  pointerDownPosition =
    'clientX' in event && 'clientY' in event
      ? {
          x: event.clientX,
          y: event.clientY,
        }
      : null;
  syncWindowPointerListeners();
};

const onValueIndicatorKeyDown = (event: KeyboardEvent) => {
  scheduleSyncValueIndicatorFocusedState();

  if (disabled) {
    return;
  }

  let nextValue: number | undefined;
  let stepDirection: -1 | 1 | undefined;

  // Preserve native range directions across horizontal, vertical, LTR, and RTL writing modes.
  switch (event.key) {
    case 'Home':
      nextValue = valueMinimum.value;
      break;
    case 'End':
      nextValue = valueMaximum.value;
      break;
    case 'ArrowLeft':
      stepDirection = vertical ? -1 : direction === 'rtl' ? 1 : -1;
      break;
    case 'ArrowRight':
      stepDirection = vertical ? 1 : direction === 'rtl' ? -1 : 1;
      break;
    case 'ArrowUp':
      stepDirection = vertical ? (direction === 'rtl' ? 1 : -1) : 1;
      break;
    case 'ArrowDown':
      stepDirection = vertical ? (direction === 'rtl' ? -1 : 1) : -1;
      break;
  }

  if (stepDirection !== undefined) {
    if (!hasValidStep.value) {
      return;
    }
    nextValue = getAdjacentStepValue(valueCurrent.value, stepDirection, step);
  }

  if (nextValue === undefined) {
    return;
  }

  event.preventDefault();
  setValueFromInteraction(nextValue, event.currentTarget as HTMLInputElement);
};

const onWindowScrollOrResize = () => {
  if (isValueIndicatorVisible.value) {
    syncValueIndicatorPosition();
  }
};

const syncWindowViewportListeners = () => {
  if (!sliderWindow || sliderWindow.closed) return;
  if (isValueIndicatorVisible.value && !isWindowViewportListenerActive) {
    sliderWindow!.addEventListener('scroll', onWindowScrollOrResize, { capture: true, passive: true });
    sliderWindow!.addEventListener('resize', onWindowScrollOrResize);
    isWindowViewportListenerActive = true;
  } else if (!isValueIndicatorVisible.value && isWindowViewportListenerActive) {
    sliderWindow!.removeEventListener('scroll', onWindowScrollOrResize, true);
    sliderWindow!.removeEventListener('resize', onWindowScrollOrResize);
    isWindowViewportListenerActive = false;
  }
};

const syncSliderInlineSize = () => {
  const slider = sliderRef.value;
  if (!slider) {
    return;
  }

  const inlineSize = vertical ? slider.clientHeight : slider.clientWidth;
  slider.style.setProperty('--slider-inline-size', `${Math.max(0, inlineSize)}px`);
};

const syncSliderMeasurements = () => {
  syncSliderInlineSize();
  syncInsetIconPlacement();
  if (isValueIndicatorVisible.value) {
    syncValueIndicatorPosition();
  }
};

const syncSliderResizeObserver = () => {
  sliderResizeObserver?.disconnect();
  sliderResizeObserver = null;

  if (typeof ResizeObserver === 'undefined' || !sliderRef.value) {
    return;
  }

  sliderResizeObserver = new ResizeObserver(() => {
    syncSliderMeasurements();
  });
  sliderResizeObserver.observe(sliderRef.value);
};

watch(value, (newValue) => {
  valueCurrent.value = newValue;
});

watch(
  [valueCurrent, () => min, () => max],
  () => {
    syncValuePresentation();
  },
  { flush: 'sync' },
);

watch(
  [sliderRef, hasStartInsetIcon, hasEndInsetIcon, stopIndicatorsFiltered, () => vertical, () => valueIndicator],
  async () => {
    syncSliderResizeObserver();
    await nextTick();
    refreshValueDisplayedStyleElements();
    syncSliderMeasurements();
  },
  {
    immediate: true,
    flush: 'post',
  },
);

watch(
  isValueIndicatorVisible,
  async () => {
    syncWindowViewportListeners();
    await nextTick();
    syncValueIndicatorPopover();
  },
  { immediate: true, flush: 'post' },
);

watch(
  [valueIndicatorRef, valueIndicatorPlacement, () => vertical, () => direction],
  async () => {
    await nextTick();
    syncValueIndicatorPopover();
  },
  { flush: 'post' },
);

watch(
  [() => vertical, () => direction, () => size.value, () => appearance.value],
  async () => {
    await nextTick();
    syncSliderMeasurements();
  },
  { flush: 'post' },
);

useElementEnvironment(sliderRef, (document) => {
  sliderWindow = document.defaultView;
  syncSliderResizeObserver();
  syncSliderMeasurements();
  syncWindowViewportListeners();
  return () => {
    sliderResizeObserver?.disconnect();
    sliderWindow?.cancelAnimationFrame(syncValueIndicatorFocusFrame);
    sliderWindow?.removeEventListener('pointermove', onWindowPointerMove);
    sliderWindow?.removeEventListener('pointerup', stopValueIndicatorDragging);
    sliderWindow?.removeEventListener('pointercancel', stopValueIndicatorDragging);
    sliderWindow?.removeEventListener('scroll', onWindowScrollOrResize, true);
    sliderWindow?.removeEventListener('resize', onWindowScrollOrResize);
    isWindowPointerMoveListenerActive = false;
    isWindowPointerEndListenerActive = false;
    isWindowViewportListenerActive = false;
    activePointerId = null;
    pointerDownPosition = null;
    isValueIndicatorDragging.value = false;
    isValueDragging.value = false;
    syncValueIndicatorFocusFrame = 0;
    sliderWindow = null;
  };
});

onMounted(() => {
  refreshValueDisplayedStyleElements();
  syncSliderMeasurements();
});

onBeforeUnmount(() => {
  hideValueIndicatorPopover();
  if (syncValueIndicatorFocusFrame) {
    sliderWindow!.cancelAnimationFrame(syncValueIndicatorFocusFrame);
  }
  stopSyncValueDisplayed();
  sliderResizeObserver?.disconnect();
  if (isWindowPointerMoveListenerActive) {
    sliderWindow!.removeEventListener('pointermove', onWindowPointerMove);
  }
  if (isWindowPointerEndListenerActive) {
    sliderWindow!.removeEventListener('pointerup', stopValueIndicatorDragging);
    sliderWindow!.removeEventListener('pointercancel', stopValueIndicatorDragging);
  }
  if (isWindowViewportListenerActive) {
    sliderWindow!.removeEventListener('scroll', onWindowScrollOrResize, true);
    sliderWindow!.removeEventListener('resize', onWindowScrollOrResize);
  }
});
</script>

<template>
  <div
    ref="slider"
    :aria-disabled="disabled"
    data-scope="slider"
    data-part="root"
    :class="[
      'm3-slider',
      `m3-slider-${size}`,
      `m3-slider-${appearance}`,
      vertical ? 'm3-slider-vertical' : 'm3-slider-horizontal',
      direction === 'rtl' ? 'm3-slider-rtl' : 'm3-slider-lrt',
      isValueDragging && 'm3-slider-value-dragging',
    ]"
  >
    <input
      ref="input"
      type="range"
      :aria-label="attrs['aria-label'] as string | undefined"
      :aria-labelledby="attrs['aria-labelledby'] as string | undefined"
      :min="min"
      :max="max"
      step="any"
      :disabled="disabled"
      :value="valueCurrent"
      :aria-valuemin="valueMinimum"
      :aria-valuemax="valueMaximum"
      :aria-valuenow="valueCurrent"
      :aria-controls="valueIndicator ? valueIndicatorId : undefined"
      :aria-expanded="valueIndicator ? (isValueIndicatorVisible ? 'true' : 'false') : undefined"
      :aria-haspopup="valueIndicator ? 'true' : undefined"
      @input="onInput"
      @change="onChange"
      @wheel="onWheel"
      @pointerenter="onValueIndicatorPointerEnter"
      @pointerleave="onValueIndicatorPointerLeave"
      @pointerdown="onValueIndicatorPointerDown"
      @keydown="onValueIndicatorKeyDown"
      @focus="onValueIndicatorFocus"
      @blur="onValueIndicatorBlur"
    />
    <div
      data-track="active"
      aria-hidden="true"
      class="m3-slider-track m3-slider-track-active"
      data-scope="slider"
      data-part="track-active"
      data-slider-percent-target="true"
    />
    <div
      data-track="inactive"
      aria-hidden="true"
      class="m3-slider-track m3-slider-track-inactive"
      data-scope="slider"
      data-part="track-inactive"
      data-slider-percent-target="true"
    />
    <template v-if="stopIndicatorsFiltered && stopIndicatorsFiltered.length > 0">
      <div
        aria-hidden="true"
        class="m3-slider-stop-indicator-container m3-slider-stop-indicator-active-container"
        data-slider-percent-target="true"
      >
        <div
          v-for="(stop, index) in stopIndicatorsFiltered"
          :key="index"
          aria-hidden="true"
          class="m3-slider-stop-indicator m3-slider-stop-indicator-active"
          :style="{
            '--percent': getValuePercent(stop),
          }"
        />
      </div>
      <div
        aria-hidden="true"
        class="m3-slider-stop-indicator-container m3-slider-stop-indicator-inactive-container"
        data-slider-percent-target="true"
      >
        <div
          v-for="(stop, index) in stopIndicatorsFiltered"
          :key="index"
          aria-hidden="true"
          class="m3-slider-stop-indicator m3-slider-stop-indicator-inactive"
          :style="{
            '--percent': getValuePercent(stop),
          }"
        />
      </div>
    </template>
    <Icon
      v-if="hasStartInsetIcon"
      data-inset-icon="start"
      data-slider-percent-target="true"
      aria-hidden="true"
      :name="startInsetIconName"
      :class="[
        'm3-slider-inset-icon',
        'm3-slider-inset-icon-start',
        isStartInsetIconFlipped ? 'm3-slider-inset-icon-flipped' : 'm3-slider-inset-icon-default',
        isStartInsetIconFlipped ? 'm3-slider-inset-icon-on-inactive' : 'm3-slider-inset-icon-on-active',
      ]"
    />
    <Icon
      v-if="hasEndInsetIcon"
      data-inset-icon="end"
      data-slider-percent-target="true"
      aria-hidden="true"
      :name="endInsetIconName"
      :class="[
        'm3-slider-inset-icon',
        'm3-slider-inset-icon-end',
        isEndInsetIconFlipped ? 'm3-slider-inset-icon-flipped' : 'm3-slider-inset-icon-default',
        isEndInsetIconFlipped ? 'm3-slider-inset-icon-on-active' : 'm3-slider-inset-icon-on-inactive',
      ]"
    />

    <div
      data-value-indicator-anchor="true"
      aria-hidden="true"
      class="m3-slider-handle"
      data-scope="slider"
      data-part="handle"
      data-slider-percent-target="true"
    />
    <div
      v-if="valueIndicator"
      :id="valueIndicatorId"
      ref="valueIndicator"
      data-value-indicator="true"
      :data-value-indicator-placement="valueIndicatorPlacement"
      :data-vtt-open="isValueIndicatorVisible ? '1' : '0'"
      data-slider-percent-target="true"
      popover="manual"
      class="m3-slider-value-indicator vtt-popover"
      data-scope="slider"
      data-part="value-indicator"
      role="tooltip"
      :aria-hidden="isValueIndicatorVisible ? undefined : 'true'"
    >
      <span class="m3-slider-value-indicator-text" data-scope="slider" data-part="value-indicator-text">
        {{ valueText }}
      </span>
    </div>
  </div>
</template>

<style src="./Slider.css"></style>
