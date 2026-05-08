<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from 'vue';
import { useKeyModifier } from '@vueuse/core';
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

  /** The amount the value changes when using the mouse wheel. */
  wheelStep?: number;

  /** The lower limit for the slider value. */
  lowerLimit?: number;

  /** The upper limit for the slider value. */
  upperLimit?: number;

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
  size = 'medium',
  min,
  max,
  step,
  disabled = false,
  lowerLimit,
  upperLimit,
  wheelStep,
  startIcon,
  endIcon,
  valueIndicator = true,
  valueIndicatorPlacement: valueIndicatorPlacementProp,
  formatter,
  stopIndicators,
} = defineProps<SliderProps>();

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

const supportsInsetIcon = computed(() => size === 'medium' || size === 'large' || size === 'extra-large');
const hasStartInsetIcon = computed(() => supportsInsetIcon.value && Boolean(startIcon));
const hasEndInsetIcon = computed(() => supportsInsetIcon.value && Boolean(endIcon));
const hasInsetIcon = computed(() => hasStartInsetIcon.value || hasEndInsetIcon.value);
const insetIconPopThreshold = computed(() => {
  switch (size) {
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

const clampValue = (nextValue: number) => {
  if (lowerLimit !== undefined && nextValue < lowerLimit) {
    return [true, lowerLimit] as const;
  } else if (upperLimit !== undefined && nextValue > upperLimit) {
    return [true, upperLimit] as const;
  } else if (nextValue < min) {
    return [true, min] as const;
  } else if (nextValue > max) {
    return [true, max] as const;
  }
  return [false, nextValue] as const;
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const [clamped, clampedValue] = clampValue(target.valueAsNumber);

  valueCurrent.value = clampedValue;
  if (isValueDragging.value) {
    syncValueDisplayedToTarget();
  }
  if (clamped) {
    event.preventDefault();
    event.stopPropagation();
    target.value = `${clampedValue}`;
  }
};

const onChange = () => {
  value.value = valueCurrent.value;
};

const altState = useKeyModifier('Alt');

const onWheel = (event: WheelEvent) => {
  if (disabled) {
    return;
  }

  const dir = event.deltaY < 0 ? 1 : -1;
  let targetStep = wheelStep ?? step;
  if (altState.value) {
    targetStep = step;
  }

  const newValue = valueCurrent.value + dir * targetStep;
  const [, clampedValue] = clampValue(newValue);
  valueCurrent.value = clampedValue;
  value.value = clampedValue;
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

const syncValueIndicatorPosition = () => {
  const slider = sliderRef.value;
  const indicator = valueIndicatorRef.value;
  if (!slider || !indicator) {
    return;
  }

  const rect = slider.getBoundingClientRect();
  indicator.style.setProperty('--value-indicator-slider-left', `${rect.left}px`);
  indicator.style.setProperty('--value-indicator-slider-right', `${rect.right}px`);
  indicator.style.setProperty('--value-indicator-slider-top', `${rect.top}px`);
  indicator.style.setProperty('--value-indicator-slider-bottom', `${rect.bottom}px`);
  indicator.style.setProperty('--value-indicator-slider-center-x', `${rect.left + rect.width / 2}px`);
  indicator.style.setProperty('--value-indicator-slider-center-y', `${rect.top + rect.height / 2}px`);
  indicator.style.setProperty('--value-indicator-viewport-right', `${Math.max(0, window.innerWidth - rect.right)}px`);
  indicator.style.setProperty(
    '--value-indicator-viewport-bottom',
    `${Math.max(0, window.innerHeight - rect.bottom)}px`,
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
    window.cancelAnimationFrame(syncValueIndicatorFocusFrame);
  }

  syncValueIndicatorFocusFrame = window.requestAnimationFrame(() => {
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
  const shouldListenPointerMove = shouldListenToWindowPointerMove();
  if (shouldListenPointerMove && !isWindowPointerMoveListenerActive) {
    window.addEventListener('pointermove', onWindowPointerMove);
    isWindowPointerMoveListenerActive = true;
  } else if (!shouldListenPointerMove && isWindowPointerMoveListenerActive) {
    window.removeEventListener('pointermove', onWindowPointerMove);
    isWindowPointerMoveListenerActive = false;
  }

  const shouldListenPointerEnd = shouldListenToWindowPointerEnd();
  if (shouldListenPointerEnd && !isWindowPointerEndListenerActive) {
    window.addEventListener('pointerup', stopValueIndicatorDragging);
    window.addEventListener('pointercancel', stopValueIndicatorDragging);
    isWindowPointerEndListenerActive = true;
  } else if (!shouldListenPointerEnd && isWindowPointerEndListenerActive) {
    window.removeEventListener('pointerup', stopValueIndicatorDragging);
    window.removeEventListener('pointercancel', stopValueIndicatorDragging);
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

const onValueIndicatorKeyDown = () => {
  scheduleSyncValueIndicatorFocusedState();
};

const onWindowScrollOrResize = () => {
  if (isValueIndicatorVisible.value) {
    syncValueIndicatorPosition();
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
  [() => vertical, () => direction, () => size],
  async () => {
    await nextTick();
    syncSliderMeasurements();
  },
  { flush: 'post' },
);

onMounted(() => {
  window.addEventListener('scroll', onWindowScrollOrResize, { capture: true, passive: true });
  window.addEventListener('resize', onWindowScrollOrResize);
  refreshValueDisplayedStyleElements();
  syncSliderMeasurements();
});

onBeforeUnmount(() => {
  hideValueIndicatorPopover();
  if (syncValueIndicatorFocusFrame) {
    window.cancelAnimationFrame(syncValueIndicatorFocusFrame);
  }
  stopSyncValueDisplayed();
  sliderResizeObserver?.disconnect();
  if (isWindowPointerMoveListenerActive) {
    window.removeEventListener('pointermove', onWindowPointerMove);
  }
  if (isWindowPointerEndListenerActive) {
    window.removeEventListener('pointerup', stopValueIndicatorDragging);
    window.removeEventListener('pointercancel', stopValueIndicatorDragging);
  }
  window.removeEventListener('scroll', onWindowScrollOrResize, true);
  window.removeEventListener('resize', onWindowScrollOrResize);
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
      vertical ? 'm3-slider-vertical' : 'm3-slider-horizontal',
      direction === 'rtl' ? 'm3-slider-rtl' : 'm3-slider-lrt',
      isValueDragging && 'm3-slider-value-dragging',
    ]"
  >
    <input
      ref="input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :value="valueCurrent"
      :aria-controls="valueIndicator ? valueIndicatorId : undefined"
      :aria-expanded="valueIndicator ? (isValueIndicatorVisible ? 'true' : 'false') : undefined"
      :aria-haspopup="valueIndicator ? 'true' : undefined"
      @input="onInput"
      @change="onChange"
      @wheel.prevent="onWheel"
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
