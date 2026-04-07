<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue';
import { useKeyModifier } from '@vueuse/core';
import { setupTooltip } from '@/directives/Tooltip/setup';
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
  stopIndicators,
} = defineProps<SliderProps>();

const valueIndicatorPlacement = computed(() => {
  return valueIndicatorPlacementProp ?? (vertical ? 'end' : 'top');
});

const value = defineModel<number>('value', { required: true });

const valueDisplayed = ref(value.value);
const valuePercent = computed(() => {
  const percent = (valueDisplayed.value - min) / (max - min);
  if (percent < 0) {
    return 0;
  } else if (percent > 1) {
    return 1;
  } else {
    return percent;
  }
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

watch(value, (newVal) => {
  valueDisplayed.value = newVal;
});

const clampValue = (v: number) => {
  if (lowerLimit !== undefined && v < lowerLimit) {
    return [true, lowerLimit] as const;
  } else if (upperLimit !== undefined && v > upperLimit) {
    return [true, upperLimit] as const;
  } else if (v < min) {
    return [true, min] as const;
  } else if (v > max) {
    return [true, max] as const;
  }
  return [false, v] as const;
};

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const valueAsNumber = target.valueAsNumber;

  const [clamped, clampedValue] = clampValue(valueAsNumber);
  if (clamped) {
    e.preventDefault();
    e.stopPropagation();
    valueDisplayed.value = clampedValue;
  }
};

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  value.value = target.valueAsNumber;
};

const altState = useKeyModifier('Alt');

const onWheel = (e: WheelEvent) => {
  if (disabled) {
    return;
  }

  const dir = e.deltaY < 0 ? 1 : -1;

  let targetStep = wheelStep ?? step;
  if (altState.value) {
    targetStep = step;
  }

  const newValue = valueDisplayed.value + dir * targetStep;
  const [, clampedValue] = clampValue(newValue);
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
const handleRef = useTemplateRef<HTMLDivElement>('handle');
const valueIndicatorRef = useTemplateRef<HTMLDivElement>('valueIndicator');
const valueIndicatorTooltip = shallowRef<ReturnType<typeof setupTooltip> | null>(null);
const isStartInsetIconFlipped = ref(false);
const isEndInsetIconFlipped = ref(false);

const isValueIndicatorHovered = ref(false);
const isValueIndicatorFocused = ref(false);
const isValueIndicatorDragging = ref(false);
const isValueDragging = ref(false);
let syncValueIndicatorFocusFrame = 0;
let syncValueIndicatorPositionFrame = 0;
let syncInsetIconPlacementFrame = 0;
let activePointerId: number | null = null;
let pointerDownPosition: { x: number; y: number } | null = null;
let insetIconResizeObserver: ResizeObserver | null = null;

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

const valueIndicatorBinding = computed(() => {
  const target = valueIndicatorRef.value;

  if (!valueIndicator || !target) {
    return undefined;
  }

  return {
    target,
    placement: valueIndicatorPlacement.value,
    interactive: false,
    popoverType: 'manual' as const,
    openDelay: 0,
    closeDelay: 0,
    longpressDelay: 0,
  };
});

const cleanupValueIndicatorTooltip = () => {
  valueIndicatorTooltip.value?.cleanup();
  valueIndicatorTooltip.value = null;
};

const stopSyncValueIndicatorPosition = () => {
  if (syncValueIndicatorPositionFrame) {
    window.cancelAnimationFrame(syncValueIndicatorPositionFrame);
    syncValueIndicatorPositionFrame = 0;
  }
};

const stopSyncInsetIconPlacement = () => {
  if (syncInsetIconPlacementFrame) {
    window.cancelAnimationFrame(syncInsetIconPlacementFrame);
    syncInsetIconPlacementFrame = 0;
  }
};

const syncInsetIconPlacement = () => {
  const slider = sliderRef.value;

  if (!slider || !hasInsetIcon.value) {
    isStartInsetIconFlipped.value = false;
    isEndInsetIconFlipped.value = false;
    return;
  }

  const inlineSize = vertical ? slider.clientHeight : slider.clientWidth;
  if (inlineSize <= 0) {
    isStartInsetIconFlipped.value = false;
    isEndInsetIconFlipped.value = false;
    return;
  }

  if (hasStartInsetIcon.value) {
    isStartInsetIconFlipped.value = inlineSize * valuePercent.value < insetIconPopThreshold.value;
  } else {
    isStartInsetIconFlipped.value = false;
  }

  if (hasEndInsetIcon.value) {
    isEndInsetIconFlipped.value = inlineSize * (1 - valuePercent.value) < insetIconPopThreshold.value;
  } else {
    isEndInsetIconFlipped.value = false;
  }
};

const syncInsetIconPlacementLoop = () => {
  syncInsetIconPlacement();
  syncInsetIconPlacementFrame = window.requestAnimationFrame(syncInsetIconPlacementLoop);
};

const syncValueIndicatorPosition = () => {
  valueIndicatorTooltip.value?.reposition();
  syncValueIndicatorPositionFrame = window.requestAnimationFrame(syncValueIndicatorPosition);
};

const startSyncValueIndicatorPosition = (event: TransitionEvent) => {
  if (event.target !== sliderRef.value || event.propertyName !== '--percent' || !valueIndicatorTooltip.value) {
    return;
  }

  stopSyncValueIndicatorPosition();
  syncValueIndicatorPositionFrame = window.requestAnimationFrame(syncValueIndicatorPosition);
};

const startSyncInsetIconPlacement = (event: TransitionEvent) => {
  if (event.target !== sliderRef.value || event.propertyName !== '--percent' || !hasInsetIcon.value) {
    return;
  }

  stopSyncInsetIconPlacement();
  syncInsetIconPlacementFrame = window.requestAnimationFrame(syncInsetIconPlacementLoop);
};

const finishSyncValueIndicatorPosition = (event: TransitionEvent) => {
  if (event.target !== sliderRef.value || event.propertyName !== '--percent') {
    return;
  }

  stopSyncValueIndicatorPosition();
  valueIndicatorTooltip.value?.reposition();
};

const finishSyncInsetIconPlacement = (event: TransitionEvent) => {
  if (event.target !== sliderRef.value || event.propertyName !== '--percent') {
    return;
  }

  stopSyncInsetIconPlacement();
  syncInsetIconPlacement();
};

const onPercentTransitionStart = (event: TransitionEvent) => {
  startSyncValueIndicatorPosition(event);
  startSyncInsetIconPlacement(event);
};

const onPercentTransitionFinish = (event: TransitionEvent) => {
  finishSyncValueIndicatorPosition(event);
  finishSyncInsetIconPlacement(event);
};

const syncValueIndicatorVisibility = () => {
  const tooltip = valueIndicatorTooltip.value;
  if (!tooltip) {
    return;
  }

  if (disabled || !valueIndicator) {
    tooltip.hide();
    return;
  }

  if (isValueIndicatorHovered.value || isValueIndicatorFocused.value || isValueIndicatorDragging.value) {
    tooltip.show();
    return;
  }

  tooltip.hide();
};

const rebuildValueIndicatorTooltip = () => {
  cleanupValueIndicatorTooltip();

  const trigger = inputRef.value;
  const anchor = handleRef.value;
  const binding = valueIndicatorBinding.value;

  if (!trigger || !anchor || !binding) {
    return;
  }

  valueIndicatorTooltip.value = setupTooltip(trigger, binding, {
    anchor,
    manual: true,
  });

  syncValueIndicatorVisibility();
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
  if (!isValueIndicatorDragging.value) {
    if (isCurrentPointerEvent(event)) {
      isValueDragging.value = false;
      activePointerId = null;
      pointerDownPosition = null;
    }
  } else {
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
};

const onWindowPointerMove = (event: PointerEvent) => {
  syncValueIndicatorHoveredState(event);

  if (event.pointerId !== activePointerId || !pointerDownPosition || isValueDragging.value) {
    return;
  }

  const diffX = event.clientX - pointerDownPosition.x;
  const diffY = event.clientY - pointerDownPosition.y;
  if (diffX * diffX + diffY * diffY < pointerDragStartDistance * pointerDragStartDistance) {
    return;
  }

  isValueDragging.value = true;
};

const onValueIndicatorPointerEnter = () => {
  if (disabled) {
    return;
  }

  isValueIndicatorHovered.value = true;
};

const onValueIndicatorPointerLeave = () => {
  isValueIndicatorHovered.value = false;
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
};

const onValueIndicatorKeyDown = () => {
  scheduleSyncValueIndicatorFocusedState();
};

const syncInsetIconResizeObserver = () => {
  insetIconResizeObserver?.disconnect();
  insetIconResizeObserver = null;

  if (!hasInsetIcon.value || typeof ResizeObserver === 'undefined' || !sliderRef.value) {
    return;
  }

  insetIconResizeObserver = new ResizeObserver(() => {
    syncInsetIconPlacement();
  });
  insetIconResizeObserver.observe(sliderRef.value);
};

watch([inputRef, handleRef, valueIndicatorRef, () => valueIndicator], rebuildValueIndicatorTooltip, {
  immediate: true,
  flush: 'post',
});

watch(
  [sliderRef, hasStartInsetIcon, hasEndInsetIcon],
  async () => {
    syncInsetIconResizeObserver();
    await nextTick();
    syncInsetIconPlacement();
  },
  {
    immediate: true,
    flush: 'post',
  },
);

watch(
  valueIndicatorBinding,
  (binding) => {
    if (!binding || !valueIndicatorTooltip.value) {
      return;
    }

    valueIndicatorTooltip.value.update(binding);
  },
  { flush: 'post' },
);

watch(
  [isValueIndicatorHovered, isValueIndicatorFocused, isValueIndicatorDragging, () => disabled, () => valueIndicator],
  syncValueIndicatorVisibility,
  { immediate: true },
);

watch(
  [valuePercent, valueIndicatorPlacement, () => vertical, () => direction],
  async () => {
    await nextTick();
    valueIndicatorTooltip.value?.reposition();
  },
  { flush: 'post' },
);

watch(
  [valuePercent, () => vertical, () => direction, () => size],
  async () => {
    await nextTick();
    syncInsetIconPlacement();
  },
  { flush: 'post' },
);

onMounted(() => {
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', stopValueIndicatorDragging);
  window.addEventListener('pointercancel', stopValueIndicatorDragging);
  syncInsetIconPlacement();
});

onBeforeUnmount(() => {
  cleanupValueIndicatorTooltip();
  if (syncValueIndicatorFocusFrame) {
    window.cancelAnimationFrame(syncValueIndicatorFocusFrame);
  }
  stopSyncValueIndicatorPosition();
  stopSyncInsetIconPlacement();
  insetIconResizeObserver?.disconnect();
  window.removeEventListener('pointermove', onWindowPointerMove);
  window.removeEventListener('pointerup', stopValueIndicatorDragging);
  window.removeEventListener('pointercancel', stopValueIndicatorDragging);
});
</script>

<template>
  <div
    ref="slider"
    :aria-disabled="disabled"
    :class="[
      'm3-slider',
      `m3-slider-${size}`,
      vertical ? 'm3-slider-vertical' : 'm3-slider-horizontal',
      direction === 'rtl' ? 'm3-slider-rtl' : 'm3-slider-lrt',
      isValueDragging && 'm3-slider-value-dragging',
    ]"
    :style="{
      '--percent': valuePercent,
    }"
    @transitionstart="onPercentTransitionStart"
    @transitionend="onPercentTransitionFinish"
    @transitioncancel="onPercentTransitionFinish"
  >
    <input
      ref="input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      v-model.number="valueDisplayed"
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
    <div data-track="active" aria-hidden="true" class="m3-slider-track m3-slider-track-active" />
    <div data-track="inactive" aria-hidden="true" class="m3-slider-track m3-slider-track-inactive" />
    <template v-if="stopIndicatorsFiltered && stopIndicatorsFiltered.length > 0">
      <div aria-hidden="true" class="m3-slider-stop-indicator-container m3-slider-stop-indicator-active-container">
        <div
          v-for="(stop, index) in stopIndicatorsFiltered"
          :key="index"
          aria-hidden="true"
          class="m3-slider-stop-indicator m3-slider-stop-indicator-active"
          :style="{
            '--percent': (stop - min) / (max - min),
          }"
        />
      </div>
      <div aria-hidden="true" class="m3-slider-stop-indicator-container m3-slider-stop-indicator-inactive-container">
        <div
          v-for="(stop, index) in stopIndicatorsFiltered"
          :key="index"
          aria-hidden="true"
          class="m3-slider-stop-indicator m3-slider-stop-indicator-inactive"
          :style="{
            '--percent': (stop - min) / (max - min),
          }"
        />
      </div>
    </template>
    <Icon
      v-if="hasStartInsetIcon"
      data-inset-icon="start"
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
      aria-hidden="true"
      :name="endInsetIconName"
      :class="[
        'm3-slider-inset-icon',
        'm3-slider-inset-icon-end',
        isEndInsetIconFlipped ? 'm3-slider-inset-icon-flipped' : 'm3-slider-inset-icon-default',
        isEndInsetIconFlipped ? 'm3-slider-inset-icon-on-active' : 'm3-slider-inset-icon-on-inactive',
      ]"
    />

    <div ref="handle" data-value-indicator-anchor="true" aria-hidden="true" class="m3-slider-handle" />
    <div v-if="valueIndicator" ref="valueIndicator" data-value-indicator="true" class="m3-slider-value-indicator">
      <span class="m3-slider-value-indicator-text">
        {{ formatter ? formatter.valueToText(valueDisplayed) : valueDisplayed }}
      </span>
    </div>
  </div>
</template>

<style src="./Slider.css"></style>
