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
</script>

# CheckBox

Checkboxes let people confirm independent selections while preserving clear unchecked, checked, and disabled states.
Use `presentation` when the checkbox is only a visual indicator inside another accessible control, such as a clickable [ListItem](/guides/selection-controls-in-list-items).

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <CheckBox v-bind="props" v-model:checked="checked">Receive notifications</CheckBox>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="checkbox" />

<ApiTable component="CheckBox" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="CheckBox" />

## Examples

### Default

<DemoContainer :src="CheckBoxDefaultSrc" :viewport="false">
  <CheckBoxDefault />
</DemoContainer>

### States

<DemoContainer :src="CheckBoxStatesSrc" :viewport="false">
  <CheckBoxStates />
</DemoContainer>
