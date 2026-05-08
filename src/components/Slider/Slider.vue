<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue';
import { useKeyModifier } from '@vueuse/core';
import { useAnimatedNumber } from '@/composables/useAnimatedNumber';
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
  syncValueDisplayedToTarget();
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
  syncValueDisplayedToTarget();
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
  valueIndicatorTooltip.value?.hide();
  valueIndicatorTooltip.value?.cleanup();
  valueIndicatorTooltip.value = null;
};

const syncInsetIconPlacement = () => {
  const slider = sliderRef.value;
  const targetPercent = getValuePercent(valueCurrent.value);

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
  valueIndicatorTooltip.value?.reposition();
  syncInsetIconPlacement();
};

const {
  displayedValue: valueDisplayed,
  stopAnimation: stopSyncValueDisplayed,
  syncToTarget: syncValueDisplayedToTarget,
} = useAnimatedNumber(valuePercent, {
  clamp: clampPercent,
  onUpdate: syncValuePresentation,
});

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
  [valueIndicatorPlacement, () => vertical, () => direction],
  async () => {
    await nextTick();
    valueIndicatorTooltip.value?.reposition();
  },
  { flush: 'post' },
);

watch(
  [() => vertical, () => direction, () => size],
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
  stopSyncValueDisplayed();
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
    data-scope="slider"
    data-part="root"
    :class="[
      'm3-slider',
      `m3-slider-${size}`,
      vertical ? 'm3-slider-vertical' : 'm3-slider-horizontal',
      direction === 'rtl' ? 'm3-slider-rtl' : 'm3-slider-lrt',
      isValueDragging && 'm3-slider-value-dragging',
    ]"
    :style="{
      '--percent': valueDisplayed,
    }"
  >
    <input
      ref="input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :value="valueCurrent"
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
    />
    <div
      data-track="inactive"
      aria-hidden="true"
      class="m3-slider-track m3-slider-track-inactive"
      data-scope="slider"
      data-part="track-inactive"
    />
    <template v-if="stopIndicatorsFiltered && stopIndicatorsFiltered.length > 0">
      <div aria-hidden="true" class="m3-slider-stop-indicator-container m3-slider-stop-indicator-active-container">
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
      <div aria-hidden="true" class="m3-slider-stop-indicator-container m3-slider-stop-indicator-inactive-container">
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

    <div
      ref="handle"
      data-value-indicator-anchor="true"
      aria-hidden="true"
      class="m3-slider-handle"
      data-scope="slider"
      data-part="handle"
    />
    <div
      v-if="valueIndicator"
      ref="valueIndicator"
      data-value-indicator="true"
      class="m3-slider-value-indicator"
      data-scope="slider"
      data-part="value-indicator"
    >
      <span class="m3-slider-value-indicator-text" data-scope="slider" data-part="value-indicator-text">
        {{ valueText }}
      </span>
    </div>
  </div>
</template>

<style src="./Slider.css"></style>
