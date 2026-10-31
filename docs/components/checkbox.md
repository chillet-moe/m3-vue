---
title: CheckBox
---

<script setup lang="ts">
import { ref } from 'vue';
import { CheckBox } from '@/components/CheckBox';

import CheckBoxDefault from '../demos/checkbox/CheckBoxDefault.vue';
import CheckBoxDefaultSrc from '../demos/checkbox/CheckBoxDefault.vue?raw';
import CheckBoxStates from '../demos/checkbox/CheckBoxStates.vue';
import CheckBoxStatesSrc from '../demos/checkbox/CheckBoxStates.vue?raw';

const props = ref({
  disabled: false,
  presentation: false,
});

const checked = ref(false);
import CheckBoxGroup from '../demos/checkbox/CheckBoxGroup.vue';
import CheckBoxGroupSrc from '../demos/checkbox/CheckBoxGroup.vue?raw';
</script>

# CheckBox

Checkboxes let people confirm independent selections while preserving clear unchecked, checked, and disabled states.
Use `presentation` when the checkbox is only a visual indicator inside another accessible control, such as a clickable [ListItem](/components/item#selection-controls).

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <CheckBox v-bind="props" v-model:checked="checked">Receive notifications</CheckBox>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

In `presentation` mode, the control occupies only `--md-checkbox-container-size` (18dp by default), without an independent hit target. `--md-checkbox-target-size` applies only to standalone interactive checkboxes (40dp by default). The parent owns spacing and interaction; this works with both ListItem and [MenuItem](/components/menu#consumer-owned-state). An explicitly larger container can grow the parent row.

## Density

Default geometry follows the `body-medium` font size. The dimensions below describe default typography; compact and custom typography scale the baseline and its bounds before applying density. Explicit geometry tokens bypass this calculation.

The visible shape starts at 18dp and changes by 1dp per `--md-density` step, clamped to 14–22dp. Selection marks and default stroke widths scale proportionally. This also applies in `presentation` mode, where the parent owns spacing and interaction.

Standalone targets start at 40dp and change by 2dp per density step, retaining at least 4dp on each side of the visible shape. The state layer follows the target, shrinking more slowly than menu row spacing to keep hover feedback visible. Explicit shape and target-size tokens override their respective defaults. Icon source calibration and `--md-icon-scale` do not affect these controls.

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
    <CheckBox v-for="density in [0, -2, -4]" :key="density" :style="{ '--md-density': density }" v-model:checked="checked">density {{ density }}</CheckBox>
  </div>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="CheckBoxDefaultSrc" :viewport="false">
  <CheckBoxDefault />
</DemoContainer>

### States

<DemoContainer :src="CheckBoxStatesSrc" :viewport="false">
  <CheckBoxStates />
</DemoContainer>

## Mixed state

`checked` owns the submitted boolean value; `indeterminate` owns the mixed visual state and native `input.indeterminate` property. Use `v-model:indeterminate` for local state or pass a computed prop for consumer-owned group state. Mixed presentation takes precedence over the checkmark and exposes `aria-checked="mixed"` on the native input.

User activation follows native checkbox behavior: toggles `checked`, emits `update:checked`, then clears `indeterminate` with `update:indeterminate(false)`. Disabled checkboxes do not update. Presentation mode renders no input and emits no interactions; the parent owns all semantics. The component never derives group selection.

<DemoContainer :src="CheckBoxGroupSrc"><CheckBoxGroup /></DemoContainer>

## Reference

<AnatomyTable scope="checkbox" />

<ApiTable component="CheckBox" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="CheckBox" />
