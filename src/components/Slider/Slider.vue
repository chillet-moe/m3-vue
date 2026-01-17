<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import style from './Slider.module.css';
import { useKeyModifier } from '@vueuse/core';

type Props = {
  vertical?: boolean;
  direction?: 'ltr' | 'rtl';
  min: number;
  max: number;
  step: number;
  wheelStep?: number;
  lowerLimit?: number;
  upperLimit?: number;
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  disabled?: boolean;
  valueIndicator?: boolean;
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
  stopIndicators,
} = defineProps<Props>();

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
  if (lowerLimit && v < lowerLimit) {
    return [true, lowerLimit];
  } else if (upperLimit && v > upperLimit) {
    return [true, upperLimit];
  } else if (v < min) {
    return [true, min];
  } else if (v > max) {
    return [true, max];
  }
  return [false, v];
};

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const valueAsNumber = target.valueAsNumber;

  const [clamped, clampedValue] = clampValue(valueAsNumber);
  if (clamped) {
    e.preventDefault();
    e.stopPropagation();
    valueDisplayed.value = clampedValue as number;
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
  const [_, clampedValue] = clampValue(newValue);
  value.value = clampedValue as number;
};

const stopIndicatorsFiltered = computed(() => {
  if (!stopIndicators) {
    return undefined;
  }
  return stopIndicators!.filter(
    (stop) => stop >= min && stop <= max
  );
});
</script>

<template>
  <div
    :aria-disabled="disabled"
    :class="[
      style.slider,
      style[size],
      vertical ? style.vertical : style.horizontal,
      direction === 'rtl' ? style.rtl : style.lrt,
    ]"
    :style="{
      '--percent': valuePercent,
    }"
  >
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      v-model.number="valueDisplayed"
      @input="onInput"
      @change="onChange"
      @wheel.prevent="onWheel"
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

    <div aria-hidden="true" :class="style.handle" />
    <div aria-hidden="true" :class="style.valueIndicator" v-if="valueIndicator">
      <span :class="style.valueIndicatorText">
        {{ formatter ? formatter.valueToText(valueDisplayed) : valueDisplayed }}
      </span>
    </div>
  </div>
</template>
