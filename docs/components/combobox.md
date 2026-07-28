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

Combobox shares Select's `labelClearance` prop and `fieldContextKey` default. Preserve the surrounding layout's
intended density and add clearance only when its floating label needs it. See the
[floating label spacing guide](../guides/floating-label-spacing-lab).

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Combobox v-bind="props" v-model="modelValue" :options="stateOptions" />
  </div>
</DemoContainer>

<ApiTable component="Combobox" v-model="props" :exclude="['options', 'multiple']" />

::: info
Combobox 是 Select 的封装，共享 `select` scope。详见 [Select Anatomy](./select)。
:::

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
