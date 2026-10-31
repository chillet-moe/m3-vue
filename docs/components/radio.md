---
title: Radio
---

<script setup lang="ts">
import { ref } from 'vue';
import { Radio } from '@/components/Radio';

import RadioDefault from '../demos/radio/RadioDefault.vue';
import RadioDefaultSrc from '../demos/radio/RadioDefault.vue?raw';
import RadioStates from '../demos/radio/RadioStates.vue';
import RadioStatesSrc from '../demos/radio/RadioStates.vue?raw';

const props = ref({
  disabled: false,
  presentation: false,
});

const checked = ref(false);
</script>

# Radio

Radio buttons present mutually exclusive choices with Material 3 state styling and accessible native form semantics.
Use `presentation` when the radio is only a visual indicator inside another accessible control, such as a clickable [ListItem](/components/item#selection-controls).

`v-model:checked` controls the radio's boolean checked state. The optional `value` remains the native form-submission
value and does not change the checked model's type. For a radio group, derive each radio's `checked` state from one shared
selected value.

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <Radio v-bind="props" v-model:checked="checked" name="radio-docs">Option A</Radio>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

In `presentation` mode, the radio occupies only `--md-radio-icon-size` (20dp by default). `--md-radio-target-size` retains the standalone interaction target (40dp by default) and does not affect presentation layout. The parent owns spacing, focus, and activation; see [Menu selection](/components/menu#selection).

## Density

Default geometry follows the `body-medium` font size. The dimensions below describe default typography; compact and custom typography scale the baseline and its bounds before applying density. Explicit geometry tokens bypass this calculation.

The visible shape starts at 20dp and changes by 1dp per `--md-density` step, clamped to 16–24dp. Selection marks and default stroke widths scale proportionally. This also applies in `presentation` mode, where the parent owns spacing and interaction.

Standalone targets start at 40dp and change by 2dp per density step, retaining at least 4dp on each side of the visible shape. The state layer follows the target, shrinking more slowly than menu row spacing to keep hover feedback visible. Explicit shape and target-size tokens override their respective defaults. Icon source calibration and `--md-icon-scale` do not affect these controls.

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
    <Radio v-for="density in [0, -2, -4]" :key="density" :style="{ '--md-density': density }" v-model:checked="checked">density {{ density }}</Radio>
  </div>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="RadioDefaultSrc" :viewport="false">
  <RadioDefault />
</DemoContainer>

### States

<DemoContainer :src="RadioStatesSrc" :viewport="false">
  <RadioStates />
</DemoContainer>

## Reference

<AnatomyTable scope="radio" />

<ApiTable component="Radio" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="Radio" />
