---
title: SliderField
---

<script setup lang="ts">
import { ref } from 'vue';
import { SliderField } from '@/components/SliderField';
import SliderFieldDefault from '../demos/slider-field/SliderFieldDefault.vue';
import SliderFieldDefaultSrc from '../demos/slider-field/SliderFieldDefault.vue?raw';

const value = ref(42.125);
const props = ref({ min: 0, max: 100, step: 1 });
</script>

# SliderField

Drag horizontally to adjust a number in a compact parameter panel. The fill shows the current value between `min` and `max`. Pressing the field keeps its current value. Dragging a quarter of the field width changes the value by a quarter of the range, snapped to the nearest step or endpoint. The field updates `v-model:value` as you drag.

<DemoContainer>
  <SliderField v-bind="props" v-model:value="value" aria-label="Amount" />
</DemoContainer>

## Size

Use `size="extra-small"`, `size="small"`, or `size="medium"` to align with a single-line TextField of the same size. Set `fieldSize` in `M3VuePlugin` for the application or provide `fieldContextKey` with a `size` for a subtree. An explicit `size` on the field takes precedence. The fallback is `extra-small`; the compact preset supplies `small` with compact typography and spacing.

## Step adjustments and exact input

Click the field or focus it and press Enter to select the number for editing. Press Enter or leave the field to commit. Escape discards the edit. An unfinished entry such as `-` leaves the model unchanged. A number outside the range is clamped to the nearest endpoint. Set `reject-out-of-range` to discard that entry on commit. Use `format-value` to add units or round the resting display. Editing starts with the full numeric value. If the bound number changes externally, the field discards its pending draft.

<DemoContainer :src="SliderFieldDefaultSrc">
  <SliderFieldDefault />
</DemoContainer>

With a `step` of `1` and a `min` of `0`, you can enter `42.125`. The next step up is `43` and the next step down is `42`. In adjustment mode, use the arrow keys to step, or Home and End to reach either limit. Both limits are reachable even when the range is not a multiple of the step.

## Reference

<AnatomyTable scope="slider-field" />

<ApiTable component="SliderField" v-model="props" :exclude="['value']" />
