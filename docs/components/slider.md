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
  stopIndicators: undefined as number[] | undefined,
});

const value = ref(2);

const stopIndicators = computed(() => {
  return props.value.stopIndicators ?? createStops(props.value.min, props.value.max, props.value.step);
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

The value indicator is rendered as a manual popover so it stays in the browser top layer instead of being clipped by parent overflow. Its animated position is driven by Slider CSS variables and transform-style movement; avoid overriding the animated `--percent` path from app code.

## Value quantization

Slider preserves externally supplied `value` values as-is, including values between step marks. This allows a Slider to display a more precise value entered through a paired text or number input without silently changing it.

Values produced by Slider interaction are quantized consistently:

- Pointer dragging and keyboard arrows use the `step` grid.
- The mouse wheel uses the `wheelStep` grid when provided, or the `step` grid otherwise. Holding Alt uses the `step` grid.
- Grids start at the effective lower limit, `max(min, lowerLimit)`. The effective upper limit, `min(max, upperLimit)`, is always selectable even when the final interval is shorter than one step.
- Home and End select the exact effective lower and upper limits.

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 1rem;">
    <Slider v-bind="props" v-model:value="value" :formatter="numericFormatter" :stop-indicators="stopIndicators" />
    <div>Value: {{ value }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="slider" />

<ApiTable component="Slider" v-model="props" />

<StyleTokenTable component="Slider" />

## Examples

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

## Shared Defaults

Set `sliderSize` through `M3VuePlugin`, or provide `sliderContextKey.size`. Explicit `size` props win; the fallback remains `medium`.

See [Other Component Defaults](/getting-started#other-component-defaults) for application and subtree examples.
