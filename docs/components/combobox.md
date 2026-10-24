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
import ComboboxAsync from '../demos/combobox/ComboboxAsync.vue';
import ComboboxAsyncSrc from '../demos/combobox/ComboboxAsync.vue?raw';
</script>

# Combobox

Combobox combines free-form text entry with option picking, making it useful for searchable single- and multi-select flows.

Combobox shares Select's size and menu-color preferences; see [Select](./select#sizes-and-toolbar-alignment) for sizes
and [Menu Appearance](./select#menu-appearance) for colors. Its `labelClearance` prop inherits from `fieldContextKey`. Preserve the surrounding layout's
intended density and add clearance only when its floating label needs it. See the
[floating label spacing guide](../guides/field-layout).

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Combobox v-bind="props" v-model="modelValue" :options="stateOptions" />
  </div>
</DemoContainer>

`Combobox` forwards Select's `closed` event after its dropdown menu finishes exiting. Use it instead of
`update:open(false)` when releasing data used by option slots.

::: info
Combobox wraps Select and shares its `select` scope. See [Select Anatomy](./select).
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

## Asynchronous results

`v-model:query` exposes the query. `filter-mode="local"` is the default; `filter-mode="external"` treats `options` as the complete current result set and does no additional filtering. The consumer owns requests, cancellation, stale-response handling, loading, and errors. Replace the list slot with status content while loading or after failure. The `empty` slot customizes the ordinary list's empty result. The example clears obsolete results during a simulated request and ignores obsolete responses.

Selected values do not depend on mounted rows or current results. Labels come from matching `options`, then `resolveLabel(value)`, then `String(value)`. Keep a consumer-owned label catalog for asynchronous results. Hidden form values and the clear button continue to work when selected options are absent. Results replacement preserves the active value when it remains enabled; otherwise navigation returns to an enabled selected result or the first enabled result. Reopening follows the same rule. Closing clears the query after the visual exit completes (`closed`); clearing the selection also clears the query.

<DemoContainer :src="ComboboxAsyncSrc" :viewport="false"><ComboboxAsync /></DemoContainer>

## Virtual lists

Combobox forwards Select's `list` and `empty` slots. Use `SelectItem` for row presentation and the same `optionProps` and `setScrollToIndex` contract. See [Select's virtual list example](./select#external-virtual-lists) for 10,000 options with single and multiple selection.

## Floating surface

See [floating surface tokens](../utilities/elevation.md#floating-surfaces) for shared theme colors, borders, shadows, and an interactive example with nested menus and dialogs.

## Reference

<ApiTable component="Combobox" v-model="props" :exclude="['options', 'multiple']" />

## Composable

`Combobox` shares the same composable as `Select`.

### useSelect

<SourceApiTable api="useSelect" />
