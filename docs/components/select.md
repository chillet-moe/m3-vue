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
import SelectVirtual from '../demos/select/SelectVirtual.vue';
import SelectVirtualSrc from '../demos/select/SelectVirtual.vue?raw';
</script>

# Select

Select provides an anchored popover for choosing one or many options, using combobox/listbox/option semantics, with optional icons, filtering, and validation text.

Field spacing belongs to the surrounding layout; preserve its intended density instead of normalizing every field
group to one gap. `labelClearance` accepts a CSS length for local block-start clearance and can inherit a subtree
default from `fieldContextKey`; it adds to any parent gap. See the
[floating label spacing guide](../guides/field-layout).

<DemoContainer>
  <div style="max-inline-size: 22rem;">
    <Select v-bind="props" v-model="modelValue" :options="coffeeOptions" />
  </div>
</DemoContainer>

## Menu Appearance

`menuColor` overrides the shared Menu color preference, with `standard` as the fallback. Configure the plugin's
`menuColor` or provide `menuDefaultsContextKey` to share a palette across menus. See [Menu](./menu#color).

## Close lifecycle

`update:open(false)` updates the control state as soon as the popover closes. `closed` follows after the popover's
visual exit completes. Filter state is retained through the exit and reset at `closed`, so the closing popover does not
change its option list or dimensions mid-animation.

## Examples

### Selection icons

`showSelectedIcon` controls the selection mark independently of selection state. It defaults to `true`; setting it to
`false` preserves each item's original `leadingIcon` or `leading` slot. An explicit `SelectItem` prop takes precedence
over the enclosing Select, then inherited Select defaults, then the built-in default. Select provides its setting to
items rendered in its `list` slot, including custom and virtual lists.

```vue
<Select :options="options" :show-selected-icon="false" />
```

Configure an application default with `selectDefaults`; call `provideSelectDefaults` in setup for a subtree:

```ts
app.use(M3VuePlugin, { selectDefaults: { showSelectedIcon: false } });
```

```vue
<script setup lang="ts">
import { provideSelectDefaults } from '@chillet/m3-vue';

provideSelectDefaults({ showSelectedIcon: false });
</script>
```

`selectContextKey` and `SelectContext` are also exported. `SelectContext.showSelectedIcon` accepts a
`MaybeRef<boolean | undefined>`. Use `provideSelectDefaults` to merge this field with inherited values; direct
`provide(selectContextKey, { showSelectedIcon: false })` replaces the entire context object. Hiding the mark does not
change selection semantics.

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

## External virtual lists

Install `@tanstack/vue-virtual` in the consuming application. The library has no runtime dependency on it. This example uses the real [TanStack Vue Virtual adapter](https://tanstack.com/virtual/latest/docs/framework/vue/vue-virtual), including row measurement and scroll-to-index.

Select and Combobox expose a `list` slot with:

| Member                       | Contract                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `entries`                    | Complete filtered result set, each `{ option, index }`; `index` is the original options index.                                            |
| `activeIndex`                | Index in `entries`, or -1. Independent of selection.                                                                                      |
| `open`                       | Whether the popover is open. Enable measurement while open.                                                                               |
| `optionProps(index)`         | Bind to the option root: stable id, function ref, role, ARIA state/position, pointer and selection handlers. Pass the index in `entries`. |
| `isOptionSelected(option)`   | Selection state for rendering a checkmark.                                                                                                |
| `setScrollToIndex(callback)` | Register the virtualizer's reveal callback; unregister with `undefined` on unmount.                                                       |

Use unique stable string or number option values. Bind `optionProps(index)`, including its function ref, to `SelectItem`. Set its `active`, `selected`, and `disabled` props from the slot state. SelectItem provides option semantics, a static whole-row highlight, a selection mark, and tabindex -1. MenuItem remains the command-menu component; ListItem is for general list content.

The input owns DOM focus. Up/Down navigate the complete logical result set and skip disabled options, without wrapping. Home/End move to the first/last enabled result while open. Enter selects (single selection closes; multiple selection remains open). Escape closes without changing selection. Tab closes and continues normal tab order. Rows have tabindex -1. The input's aria-activedescendant is omitted while the active row is unmounted and restored by its function ref after mounting. The component owns the manual Popover and its outside-pointer, focus-leave, Escape, and Tab dismissal, registering and cleaning up listeners on the owning Document.

The virtualizer owns visible ranges, scrolling and measurement. Register `scrollToIndex` when opening and use `measureElement` with `data-index` for variable-height rows. Its ResizeObserver handles viewport and row changes. Keep content padding inside the scroll region; the example has one scroll viewport with the scrollbar at its outer edge.

<DemoContainer :src="SelectVirtualSrc" :viewport="false"><SelectVirtual /></DemoContainer>

<details><summary>VirtualOptions implementation</summary>

<<< @/demos/select/VirtualOptions.vue

</details>

## SelectItem

SelectItem owns option presentation, not selection or keyboard navigation. Use it in the `list` slot of Select or Combobox. Ordinary Select lists use the same component internally. It renders a non-button row; `active` and `selected` are independent. It composes the standard ListItem layout and accepts its public `--md-item-*` tokens for layout and colors.

<AnatomyTable scope="select-item" />

<ApiTable component="SelectItem" />

For consumer-owned search, loading and error states, see [Combobox](./combobox#asynchronous-results).

## Migration

Select/Combobox now use combobox/listbox/option semantics, with focus retained on the input. Replace tests and styles that depend on Menu's private DOM. `optionLeading` and `optionTrailing` remain available.

Public `useSelect` accepts `id`, `focus`, and `blur` callbacks instead of Menu, trigger and TextField refs. Bind the shared `open` ref to Popover and call `handleMenuClosed` from `closed`. Use `list`/`optionProps` for ordinary or virtual rendering; `handleMenuSelect` is removed.

## Floating surface

See [floating surface tokens](../utilities/elevation.md#floating-surfaces) for shared theme colors, borders, shadows, and an interactive example with nested menus and dialogs.

## Reference

<AnatomyTable scope="select" />

<ApiTable component="Select" v-model="props" :exclude="['options', 'multiple']" />

## Composable

### useSelect

<SourceApiTable api="useSelect" />
