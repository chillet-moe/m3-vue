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
import FieldSizes from '../demos/shared/FieldSizes.vue';
import FieldSizesSrc from '../demos/shared/FieldSizes.vue?raw';

const props = ref({
  label: 'Coffee',
  size: 'medium',
  labelClearance: undefined,
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

Field spacing belongs to the surrounding layout; preserve its intended density instead of normalizing every field
group to one gap. `labelClearance` accepts a CSS length for local block-start clearance and can inherit a subtree
default from `fieldContextKey`; it adds to any parent gap. See the
[floating label spacing guide](../guides/floating-label-spacing-lab).

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Select v-bind="props" v-model="modelValue" :options="coffeeOptions" />
  </div>
</DemoContainer>

<AnatomyTable scope="select" />

<ApiTable component="Select" v-model="props" :exclude="['options', 'multiple']" />

## Examples

### Sizes and toolbar alignment

Select uses the same `extra-small` (32px), `small` (40px), and `medium` (56px) trigger sizes as TextField. The default remains `medium`.

<DemoContainer :src="FieldSizesSrc">
  <FieldSizes />
</DemoContainer>

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

## Composable

### useSelect

<SourceApiTable api="useSelect" />
