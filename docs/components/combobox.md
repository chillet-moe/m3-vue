---
title: Combobox
---

<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Combobox } from '@/components/Combobox';
import { stateOptions } from '../demos/shared/selectOptions';

import ComboboxDefault from '../demos/combobox/ComboboxDefault.vue';
import ComboboxDefaultSrc from '../demos/combobox/ComboboxDefault.vue?raw';
import ComboboxMultiSelect from '../demos/combobox/ComboboxMultiSelect.vue';
import ComboboxMultiSelectSrc from '../demos/combobox/ComboboxMultiSelect.vue?raw';

const props = ref({
  label: 'State',
  labelClearance: undefined,
  disabled: false,
  required: false,
  placeholder: 'Choose a state',
  filterPlaceholder: 'Filter states',
});

const modelValue = ref<SelectModelValue>(undefined);
</script>

# Combobox

Combobox combines free-form text entry with option picking, making it useful for searchable single- and multi-select flows.

Combobox shares Select's size and menu-color preferences; see [Select](./select#sizes-and-toolbar-alignment) for sizes
and [Menu Appearance](./select#menu-appearance) for colors. Its `labelClearance` prop inherits from `fieldContextKey`. Preserve the surrounding layout's
intended density and add clearance only when its floating label needs it. See the
[field layout guide](../guides/field-layout#label-clearance).

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Combobox v-bind="props" v-model="modelValue" :options="stateOptions" />
  </div>
</DemoContainer>

<ApiTable component="Combobox" v-model="props" :exclude="['options', 'multiple']" />

`Combobox` forwards Select's `closed` event after its dropdown menu finishes exiting. Use it instead of
`update:open(false)` when releasing data used by option slots.

::: info
Combobox wraps Select and shares its `select` scope. See [Select Anatomy](./select).
:::

## Virtual lists and external search

Combobox forwards `list`, `v-model:query`, `filterMode`, and `resolveLabel` to Select. Use the same `SelectItem`
composition for virtual rows; filtering and navigation operate on the complete logical result set while focus
stays in the input. See [external virtual lists](./select#external-virtual-lists) and
[selected label resolution](./select#search-results-and-selected-labels).

## Examples

### Default

<DemoContainer :src="ComboboxDefaultSrc">
  <ComboboxDefault />
</DemoContainer>

### Multiple Selection

<DemoContainer :src="ComboboxMultiSelectSrc">
  <ComboboxMultiSelect />
</DemoContainer>

## Composable

`Combobox` shares the same composable as `Select`.

### useSelect

<SourceApiTable api="useSelect" />
