---
title: TextField
---

<script setup lang="ts">
import { ref } from 'vue';
import { TextField } from '@/components/TextField';

import TextFieldDefault from '../demos/text-field/TextFieldDefault.vue';
import TextFieldDefaultSrc from '../demos/text-field/TextFieldDefault.vue?raw';
import TextFieldConfigurations from '../demos/text-field/TextFieldConfigurations.vue';
import TextFieldConfigurationsSrc from '../demos/text-field/TextFieldConfigurations.vue?raw';

const props = ref({
  label: 'Label',
  disabled: false,
  required: false,
  description: 'Supporting text',
  placeholder: '',
  error: '',
});

const modelValue = ref('');
</script>

# TextField

Text fields cover baseline Material 3 input cases including supporting text, validation, adornments, and multiline entry.

## Demo

### Interactive

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <TextField v-bind="props" v-model="modelValue" />
  </div>
</DemoContainer>

<ApiTable component="TextField" v-model="props" :exclude="['as', 'rows']" />

### Default

<DemoContainer :src="TextFieldDefaultSrc">
  <TextFieldDefault />
</DemoContainer>

### Configurations

<DemoContainer :src="TextFieldConfigurationsSrc">
  <TextFieldConfigurations />
</DemoContainer>
