<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue';
import style from './Slider.module.css';
import { useKeyModifier } from '@vueuse/core';
import { setupTooltip } from '@/directives/Tooltip/setup';

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

const isValueIndicatorHovered = ref(false);
const isValueIndicatorFocused = ref(false);
const isValueIndicatorDragging = ref(false);
const isValueDragging = ref(false);
let syncValueIndicatorFocusFrame = 0;
let syncValueIndicatorPositionFrame = 0;
let activePointerId: number | null = null;
let pointerDownPosition: { x: number; y: number } | null = null;

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

const finishSyncValueIndicatorPosition = (event: TransitionEvent) => {
  if (event.target !== sliderRef.value || event.propertyName !== '--percent') {
    return;
  }

  stopSyncValueIndicatorPosition();
  valueIndicatorTooltip.value?.reposition();
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

watch([inputRef, handleRef, valueIndicatorRef, () => valueIndicator], rebuildValueIndicatorTooltip, {
  immediate: true,
  flush: 'post',
});

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

onMounted(() => {
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', stopValueIndicatorDragging);
  window.addEventListener('pointercancel', stopValueIndicatorDragging);
});

onBeforeUnmount(() => {
  cleanupValueIndicatorTooltip();
  if (syncValueIndicatorFocusFrame) {
    window.cancelAnimationFrame(syncValueIndicatorFocusFrame);
  }
  stopSyncValueIndicatorPosition();
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
      style.slider,
      style[size],
      vertical ? style.vertical : style.horizontal,
      direction === 'rtl' ? style.rtl : style.lrt,
      isValueDragging && style.valueDragging,
    ]"
    :style="{
      '--percent': valuePercent,
    }"
    @transitionstart="startSyncValueIndicatorPosition"
    @transitionend="finishSyncValueIndicatorPosition"
    @transitioncancel="finishSyncValueIndicatorPosition"
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
    <div aria-hidden="true" :class="style.trackActive" />
    <div aria-hidden="true" :class="style.trackInactive" />
    <template v-if="stopIndicatorsFiltered && stopIndicatorsFiltered.length > 0">
      <div aria-hidden="true" :class="style.stopIndicatorActiveContainer">
        <div
          v-for="(stop, index) in stopIndicatorsFiltered"
          :key="index"
          aria-hidden="true"
          :class="style.stopIndicatorActive"
          :style="{
            '--percent': (stop - min) / (max - min),
          }"
        />
      </div>
      <div aria-hidden="true" :class="style.stopIndicatorInactiveContainer">
        <div
          v-for="(stop, index) in stopIndicatorsFiltered"
          :key="index"
          aria-hidden="true"
          :class="style.stopIndicatorInactive"
          :style="{
            '--percent': (stop - min) / (max - min),
          }"
        />
      </div>
    </template>

    <div ref="handle" data-value-indicator-anchor="true" aria-hidden="true" :class="style.handle" />
    <div v-if="valueIndicator" ref="valueIndicator" data-value-indicator="true" :class="style.valueIndicator">
      <span :class="style.valueIndicatorText">
        {{ formatter ? formatter.valueToText(valueDisplayed) : valueDisplayed }}
      </span>
    </div>
  </div>
</template>
