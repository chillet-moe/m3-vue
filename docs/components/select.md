---
title: Select
---

<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { coffeeOptions } from '../demos/shared/selectOptions';

import SelectDefault from '../demos/select/SelectDefault.vue';
import SelectDefaultSrc from '../demos/select/SelectDefault.vue?raw';
import SelectWithoutIcons from '../demos/select/SelectWithoutIcons.vue';
import SelectWithoutIconsSrc from '../demos/select/SelectWithoutIcons.vue?raw';
import SelectFiltering from '../demos/select/SelectFiltering.vue';
import SelectFilteringSrc from '../demos/select/SelectFiltering.vue?raw';
import SelectConfigurations from '../demos/select/SelectConfigurations.vue';
import SelectConfigurationsSrc from '../demos/select/SelectConfigurations.vue?raw';

const props = ref({
  label: 'Coffee',
  disabled: false,
  required: false,
  placeholder: 'Choose an option',
  filterable: false,
  filterPlaceholder: 'Filter options',
});

const modelValue = ref<SelectModelValue>(undefined);
</script>

# Select

Select provides an anchored menu for choosing one or many options, with optional icons, filtering, and validation text.

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Select v-bind="props" v-model="modelValue" :options="coffeeOptions" />
  </div>
</DemoContainer>

<ApiTable component="Select" v-model="props" :exclude="['options', 'multiple']" />

## Examples

### Default

<DemoContainer :src="SelectDefaultSrc">
  <SelectDefault />
</DemoContainer>

### Without Icons

<DemoContainer :src="SelectWithoutIconsSrc">
  <SelectWithoutIcons />
</DemoContainer>

### Filtering

<DemoContainer :src="SelectFilteringSrc">
  <SelectFiltering />
</DemoContainer>

### Configurations

<DemoContainer :src="SelectConfigurationsSrc">
  <SelectConfigurations />
</DemoContainer>
