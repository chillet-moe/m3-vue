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

## Menu Appearance

`menuColor` overrides the shared Menu color preference, with `standard` as the fallback. Configure the plugin's
`menuColor` or provide `menuDefaultsContextKey` to share a palette across menus. See [Menu](./menu#color).

## Close lifecycle

`update:open(false)` updates the control state as soon as the native menu closes. `closed` follows after the menu's
visual exit completes. Filter state is retained through the exit and reset at `closed`, so the closing menu does not
change its option list or dimensions mid-animation.

## Examples

### Sizes and toolbar alignment

Select and Combobox use the same `extra-small` (32px), `small` (40px), and `medium` (56px) trigger sizes as TextField.
The `size` prop overrides `fieldContextKey`'s `size`, with `medium` as the fallback. Configure `fieldSize` through
`M3VuePlugin` or provide the context for a subtree. See [component defaults](/getting-started#component-defaults).

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
