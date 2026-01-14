<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import style from './Slider.module.css';
import { useKeyModifier } from '@vueuse/core';

type Props = {
  vertical?: boolean
  direction?: 'ltr' | 'rtl'
  min: number
  max: number
  step: number
  wheelStep?: number
  lowerLimit?: number
  upperLimit?: number
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL'
  disabled?: boolean
  valueIndicator?: boolean
  formatter?: {
    valueToText: (value: number) => string
    textToValue: (text?: string) => number | undefined
  },
  stopIndicators?: number[]
};

const {
  vertical = false,
  direction = 'ltr',
  size = 'M',
  min,
  max,
  step,
  disabled = false,
  lowerLimit,
  upperLimit,
  wheelStep,
  valueIndicator = true
} = defineProps<Props>();

const value = defineModel<number>('value', { required: true });

const valueDisplayed = ref(value.value);
const valuePercent = computed(() => (valueDisplayed.value - min) / (max - min));


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

</script>

<template>
  <div
    :aria-disabled="disabled"
    :class="[
      style.Slider,
      style[size],
      vertical ? style.Vertical : style.Horizontal,
      direction === 'rtl' ? style.RTL : style.LTR
    ]"
    :style="{
      '--percent': valuePercent
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
    <div aria-hidden="true" :class="style.TrackActive"/>
    <div aria-hidden="true" :class="style.TrackInactive"/>
    <template v-if="stopIndicators">
      <div aria-hidden="true" :class="style.StopIndicatorActiveContainer">
        <div
          v-for="(stop, index) in stopIndicators"
          :key="index"
          aria-hidden="true"
          :class="style.StopIndicatorActive"
          :style="{
            '--percent': (stop - min) / (max - min)
          }"
        />
      </div>
      <div aria-hidden="true" :class="style.StopIndicatorInactiveContainer">
        <div
          v-for="(stop, index) in stopIndicators"
          :key="index"
          aria-hidden="true"
          :class="style.StopIndicatorInactive"
          :style="{
            '--percent': (stop - min) / (max - min)
          }"
        />
      </div>
    </template>

    <div aria-hidden="true" :class="style.Handle"/>
    <div aria-hidden="true" :class="style.ValueIndicator" v-if="valueIndicator">
      <span :class="style.ValueIndicatorText">
        {{ formatter ? formatter.valueToText(valueDisplayed) : valueDisplayed }}
      </span>
    </div>
  </div>
</template>
