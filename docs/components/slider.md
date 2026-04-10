---
title: Slider
---

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Slider } from '@/components/Slider';
import { createStops, numericFormatter } from '../demos/shared/slider';

import SliderDefault from '../demos/slider/SliderDefault.vue';
import SliderDefaultSrc from '../demos/slider/SliderDefault.vue?raw';
import SliderDirections from '../demos/slider/SliderDirections.vue';
import SliderDirectionsSrc from '../demos/slider/SliderDirections.vue?raw';
import SliderVertical from '../demos/slider/SliderVertical.vue';
import SliderVerticalSrc from '../demos/slider/SliderVertical.vue?raw';
import SliderSizes from '../demos/slider/SliderSizes.vue';
import SliderSizesSrc from '../demos/slider/SliderSizes.vue?raw';
import SliderValueIndicators from '../demos/slider/SliderValueIndicators.vue';
import SliderValueIndicatorsSrc from '../demos/slider/SliderValueIndicators.vue?raw';
import SliderInsetIcons from '../demos/slider/SliderInsetIcons.vue';
import SliderInsetIconsSrc from '../demos/slider/SliderInsetIcons.vue?raw';
import SliderDisabled from '../demos/slider/SliderDisabled.vue';
import SliderDisabledSrc from '../demos/slider/SliderDisabled.vue?raw';

const props = ref({
  min: 0,
  max: 5,
  step: 1,
  size: 'medium',
  direction: 'ltr',
  vertical: false,
  startIcon: undefined,
  endIcon: undefined,
  disabled: false,
  valueIndicator: true,
  valueIndicatorPlacement: undefined,
});

const value = ref(2);

const stopIndicators = computed(() => {
  return createStops(props.value.min, props.value.max, props.value.step);
});

watch(
  () => [props.value.min, props.value.max],
  ([min, max]) => {
    if (value.value < min) {
      value.value = min;
    } else if (value.value > max) {
      value.value = max;
    }
  },
  { immediate: true },
);
</script>

# Slider

Slider handles horizontal and vertical range input, inset icons, value indicators, and directional layouts with keyboard-friendly behavior.

## Demo

### Interactive

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 1rem;">
    <Slider v-bind="props" v-model:value="value" :formatter="numericFormatter" :stop-indicators="stopIndicators" />
    <div>Value: {{ value }}</div>
  </div>
</DemoContainer>

<ApiTable component="Slider" v-model="props" :exclude="['formatter', 'stopIndicators', 'lowerLimit', 'upperLimit', 'wheelStep']" />

### Default

<DemoContainer :src="SliderDefaultSrc" :viewport="false">
  <SliderDefault />
</DemoContainer>

### Directions

<DemoContainer :src="SliderDirectionsSrc" :viewport="false">
  <SliderDirections />
</DemoContainer>

### Vertical

<DemoContainer :src="SliderVerticalSrc" :viewport="false">
  <SliderVertical />
</DemoContainer>

### Sizes

<DemoContainer :src="SliderSizesSrc" :viewport="false">
  <SliderSizes />
</DemoContainer>

### Value Indicator Placements

<DemoContainer :src="SliderValueIndicatorsSrc" :viewport="false">
  <SliderValueIndicators />
</DemoContainer>

### Inset Icons

<DemoContainer :src="SliderInsetIconsSrc" :viewport="false">
  <SliderInsetIcons />
</DemoContainer>

### Disabled

<DemoContainer :src="SliderDisabledSrc" :viewport="false">
  <SliderDisabled />
</DemoContainer>
