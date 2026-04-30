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
  disabled: false,
  presentation: false,
  checkedIcon: 'check',
  uncheckedIcon: undefined,
});

const checked = ref(false);
</script>

# Switch

Switches communicate an immediate on or off state and support optional checked and unchecked icon affordances.
Use `presentation` when the switch is only a visual indicator inside another accessible control, such as a clickable [ListItem](/guides/selection-controls-in-list-items).

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <Switch v-bind="props" v-model:checked="checked">Airplane mode</Switch>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="switch" />

<ApiTable component="Switch" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="Switch" />

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
