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
});

const checked = ref(false);
</script>

# Radio

Radio buttons present mutually exclusive choices with Material 3 state styling and accessible native form semantics.

<DemoContainer :viewport="false">
  <div style="display: grid; gap: 0.75rem;">
    <Radio v-bind="props" v-model:checked="checked" name="radio-docs">Option A</Radio>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</DemoContainer>

<AnatomyTable scope="radio" />

<ApiTable component="Radio" v-model="props" :exclude="['name', 'value', 'ariaLabel']" />

<StyleTokenTable component="Radio" />

## Examples

### Default

<DemoContainer :src="RadioDefaultSrc" :viewport="false">
  <RadioDefault />
</DemoContainer>

### States

<DemoContainer :src="RadioStatesSrc" :viewport="false">
  <RadioStates />
</DemoContainer>
