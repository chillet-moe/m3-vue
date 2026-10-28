---
title: Select
---

<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { coffeeOptions } from '../demos/shared/selectOptions';

import SelectVirtual from '../demos/select/SelectVirtual.vue';
import SelectVirtualSrc from '../demos/select/SelectVirtual.vue?raw';

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
[field layout guide](../guides/field-layout#label-clearance).

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

### Selected checkmarks

Set `:show-selected-icon="false"` on Select or Combobox to hide checkmarks while keeping the selected background,
leading content, and selection semantics. Rows without leading content reserve no checkmark space and their text
does not shift on selection. This also applies to `SelectItem` rows in a custom `list` slot.

For an application default, use `app.use(M3VuePlugin, { selectDefaults: { showSelectedIcon: false } })`.
For a subtree, call `provideSelectDefaults({ showSelectedIcon: ref(false) })` in setup. The public
`selectContextKey` is also available for direct provision. Precedence is instance prop → subtree defaults →
application defaults → `true`. `provideSelectDefaults` inherits omitted fields; refs remain reactive and setting
a preference or prop to `undefined` restores inheritance.

## External virtual lists

The `list` slot replaces only the option rendering. Select retains the Menu surface, scroll container,
selection, filtering, keyboard navigation, and close lifecycle. Render `SelectItem` with each entry's `option`
and its index **in the filtered entries**, keyed by `option.value`. Values must be unique and stable.
`SelectItem` uses the same MenuItem presentation as the built-in list, including icons, selection motion and
endpoint shapes. Its `default`, `leading`, and `trailing` slots receive `{ option, selected }`.

The slot provides:

- `entries`: the complete filtered collection of `{ option, index }`; each entry's `index` refers to the original options.
- `scrollElement`: the existing MenuContainer scroll element; use it as the virtualizer's scroll element.
- `open`: whether the popup is open; disable measurement while closed.
- `activeIndex`: the active index in the filtered collection, independent of selection.
- `setScrollToIndex(callback)`: register a virtualizer scroll callback and unregister with `undefined` on unmount.

Keep the full logical result set in `options`. Do not pass only the mounted window. The virtualizer owns row
measurement and placement; it should not add a second scroll container or selection state. Virtual rows do not
use the built-in list's filtering transitions, and remounting a selected row does not replay selection keyframes.
Use `list` for custom lists with either Select or Combobox. TanStack is used only in this example, not by the library.

<DemoContainer :src="SelectVirtualSrc"><SelectVirtual /></DemoContainer>

<details><summary>Shared virtual-list component</summary>

<<< ../demos/select/VirtualSelectList.vue

</details>

## Search results and selected labels

`v-model:query` exposes the filter text. Local filtering is the default. With `filterMode="external"`, the caller
loads and supplies the complete current result set; it owns request cancellation and stale-response handling.
`resolveLabel(value)` supplies a label for a selected value absent from those results. Read a reactive label cache
in this synchronous callback; update that cache when asynchronous data arrives. Missing labels fall back to the
string value. Clearing and form submission continue to use the selected values, independent of mounted rows.

## Keyboard and accessibility

The field has `combobox` semantics and controls a `listbox` containing `option` rows. Focus remains in the field.
Arrow keys navigate the full enabled collection with wrapping; Home/End move to its endpoints while open.
Enter selects the active option; Space also selects for non-filterable Select. Escape and Tab close the popup.
Navigation does not select an option. `aria-activedescendant` is present only while the active row is mounted.
Consumers migrating custom DOM queries should use these roles instead of the previous menu item roles.

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
