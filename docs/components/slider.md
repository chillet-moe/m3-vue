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
import SliderPreciseValue from '../demos/slider/SliderPreciseValue.vue';
import SliderPreciseValueSrc from '../demos/slider/SliderPreciseValue.vue?raw';
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

The `size` prop overrides `sliderContextKey`'s `size`, with `medium` as the fallback. Set `sliderSize` in
`M3VuePlugin` for an application default, or provide the context for a subtree. See [component defaults](/getting-started#component-defaults).

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

## Slider appearance

`appearance="standard"` is the default: a 4px neutral inactive track, a 16px circular thumb at medium size, and a separate 32px hit area. Extra-small and small use 14px thumbs; large and extra-large use 18px and 20px. `size` and `appearance` are independent. Focus uses a visible outline; hover and press add a small halo without changing geometry.

`appearance="expressive"` preserves the original thick track and vertical handle. Inset icons are supported only for expressive medium, large, and extra-large; standard omits them. Both appearances support stop markers, all value-indicator placements, formatting, vertical orientation, RTL, disabled state, limits and step quantization. The standard indicator is compact and remains a top-layer popover. `:value-indicator="false"` hides only the visual hint.

Standard sizing tokens are `--md-slider-track-thickness`, `--md-slider-thumb-size`, and `--md-slider-target-size`. Existing `--md-slider-active-track-color`, `--md-slider-inactive-track-color`, `--md-slider-handle-color`, and indicator color tokens apply to both appearances. Keep the hit area at least as large as the thumb. Programmatic values remain exact; Slider interactions snap to the step grid. The paired number field is consumer-owned.

### Precise numeric input

<DemoContainer :src="SliderPreciseValueSrc" :viewport="false"><SliderPreciseValue /></DemoContainer>

### Migrating the default

Set `appearance="expressive"` per instance, provide `sliderContextKey` with `{ appearance: 'expressive' }`, or use `sliderAppearance: 'expressive'` in M3 defaults to retain the previous appearance. For choosing appearance and density together, see [Styling](../guides/styling).
