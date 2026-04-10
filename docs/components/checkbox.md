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
});

const checked = ref(false);
</script>

# CheckBox

Checkboxes let people confirm independent selections while preserving clear unchecked, checked, and disabled states.

## Demo

### Interactive

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <CheckBox v-bind="props" v-model:checked="checked">Receive notifications</CheckBox>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

<ApiTable component="CheckBox" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

### Default

<DemoContainer :src="CheckBoxDefaultSrc" :viewport="false">
  <CheckBoxDefault />
</DemoContainer>

### States

<DemoContainer :src="CheckBoxStatesSrc" :viewport="false">
  <CheckBoxStates />
</DemoContainer>
