---
title: Switch
---

<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '@/components/Switch';

import SwitchDefault from '../demos/switch/SwitchDefault.vue';
import SwitchDefaultSrc from '../demos/switch/SwitchDefault.vue?raw';
import SwitchWithIcon from '../demos/switch/SwitchWithIcon.vue';
import SwitchWithIconSrc from '../demos/switch/SwitchWithIcon.vue?raw';
import SwitchStates from '../demos/switch/SwitchStates.vue';
import SwitchStatesSrc from '../demos/switch/SwitchStates.vue?raw';

const props = ref({
  size: undefined as 'small' | 'medium' | undefined,
  disabled: false,
  presentation: false,
  checkedIcon: 'check',
  uncheckedIcon: undefined,
});

const checked = ref(false);
</script>

# Switch

Switches communicate an immediate on or off state and support optional checked and unchecked icon affordances.
Use `presentation` when the switch is only a visual indicator inside another accessible control, such as a clickable [ListItem](/components/item#selection-controls).

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <Switch v-bind="props" v-model:checked="checked">Airplane mode</Switch>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

## Size

Use `size="small"` for dense tool panels and `size="medium"` (the default) for the standard Material proportions. At default typography and density 0, track heights are 24dp and 32dp respectively. Set `switchSize` in `M3VuePlugin` options for an application default; an explicit component prop takes precedence.

```ts
app.use(M3VuePlugin, { switchSize: 'small' });
```

The global default also accepts a Vue ref for reactive updates.

<DemoContainer :viewport="false">
  <div style="display: flex; gap: 16px; align-items: center;">
    <Switch size="small" v-model:checked="checked">Small</Switch>
    <Switch size="medium" v-model:checked="checked">Medium</Switch>
  </div>
</DemoContainer>

In `presentation` mode only the track occupies layout space. The owning row supplies interaction and hover feedback; `--md-switch-target-size` does not add space to presentation controls.

## Density

Default geometry follows the `body-medium` font size. The dimensions below describe default typography; compact and custom typography scale the baseline and its bounds before applying density. Explicit geometry tokens bypass this calculation.

The medium track height starts at 32dp and changes by 1dp per density step, clamped to 28–36dp. Small starts at 24dp, clamped to 20–28dp. Track width, handle sizes, travel insets, outlines and internal icons scale proportionally. Explicit component tokens override individual dimensions; setting track height also establishes the default proportions.

The interaction and hover target starts at 40dp for medium and 32dp for small, and changes by 2dp per step, retaining at least 4dp above and below the track. Icon scale and source calibration do not affect Switch geometry.

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
    <Switch v-for="density in [0, -2, -4]" :key="density" :style="{ '--md-density': density }" v-model:checked="checked">density {{ density }}</Switch>
  </div>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="SwitchDefaultSrc" :viewport="false">
  <SwitchDefault />
</DemoContainer>

### With Icon

<DemoContainer :src="SwitchWithIconSrc" :viewport="false">
  <SwitchWithIcon />
</DemoContainer>

### States

<DemoContainer :src="SwitchStatesSrc" :viewport="false">
  <SwitchStates />
</DemoContainer>

## Reference

<AnatomyTable scope="switch" />

<ApiTable component="Switch" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="Switch" />
