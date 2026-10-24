---
title: ListItem
---

<script setup lang="ts">
import { ref } from 'vue';
import { ListItem } from '@/components/ListItem';

import ItemDefault from '../demos/item/ItemDefault.vue';
import ItemDefaultSrc from '../demos/item/ItemDefault.vue?raw';
import ItemCompositions from '../demos/item/ItemCompositions.vue';
import ItemCompositionsSrc from '../demos/item/ItemCompositions.vue?raw';
import ItemRouterLink from '../demos/item/ItemRouterLink.vue';
import ItemRouterLinkSrc from '../demos/item/ItemRouterLink.vue?raw';

const props = ref({
  appearance: 'standard',
  interactive: true,
  shape: 'rounded',
  disabled: false,
  active: false,
  href: undefined,
  leadingIcon: 'person',
  trailingIcon: 'chevron_right',
  title: 'Profile',
  description: 'Manage your account settings.',
});
import ItemAppearances from '../demos/item/ItemAppearances.vue';
import ItemAppearancesSrc from '../demos/item/ItemAppearances.vue?raw';
import SelectionControlsInListItems from '../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue';
import SelectionControlsInListItemsSrc from '../demos/selection-controls-in-list-items/SelectionControlsInListItems.vue?raw';
</script>

# ListItem

ListItem provides a rich list-entry layout. It is interactive by default and renders as a button, or as an anchor when
`href` is set. Set `interactive="false"` for a passive information row or a row whose nested control owns the
interaction; passive items render as `div` elements without button, link, focus, state-layer, or press behavior. Any
`href` is ignored while the item is passive.

<DemoContainer><ListItem v-bind="props" /></DemoContainer>

`ListItem` automatically participates in the [List Grouping](/utilities/list-grouping) CSS utility, which can also group
other elements and components.

## Examples

### Default

<DemoContainer :src="ItemDefaultSrc"><ItemDefault /></DemoContainer>

### Compositions

<DemoContainer :src="ItemCompositionsSrc"><ItemCompositions /></DemoContainer>

### Vue Router

When `ListItem` is acting as navigation, use `RouterLink custom` and feed its `href` and `navigate` into the component.

<DemoContainer :src="ItemRouterLinkSrc"><ItemRouterLink /></DemoContainer>

## Appearance

`appearance="standard"` is the default: a fixed whole-row active indicator, compact corners, and no expanding highlight or press shape morph. `appearance="expressive"` retains the expanding indicator and press morph. Appearance does not change button/link/presentation semantics, slots, or layout tokens. Set `listItemDefaults.appearance` in `M3VuePlugin` for an application default, or call `provideListItemDefaults({ appearance: 'expressive' })` for a subtree. An explicit `appearance` prop takes precedence. `SelectItem` has an explicit `standard` appearance and is unaffected by this default.

<DemoContainer :src="ItemAppearancesSrc"><ItemAppearances /></DemoContainer>

Set `appearance="expressive"` on existing items to retain the previous appearance. The `shape` prop controls the expressive shape; standard uses `--md-shape-compact`. `--md-item-indicator-shape` can customize the indicator in either appearance.

Use [SelectItem](./select#selectitem) for selection options and [MenuItem](./menu) for menu commands. ListItem remains a general list entry. See [Styling](../guides/styling) for appearance and density choices.

## Selection Controls in List Items {#selection-controls}

`CheckBox`, `Radio`, and `Switch` can appear inside a list item as state indicators. In that layout the row is usually the larger, easier target, while the selection control only communicates the current state.

Use the control's `presentation` prop for this case. Presentation mode keeps the Material 3 visual state, but removes the nested native input, hides the visual control from assistive technology, and disables the control's own state-layer effect. The parent row must provide the accessible name, role, checked state, disabled state, and interaction feedback.

### Pattern

<DemoContainer :src="SelectionControlsInListItemsSrc" :viewport="false"><SelectionControlsInListItems /></DemoContainer>

### Accessibility Rules

- Keep one interactive target per row. The row is the control; the visual `CheckBox`, `Radio`, or `Switch` is not another focusable element.
- Put the accessible name on the row, usually through visible `title` text.
- Set `aria-checked` on the row and keep it synchronized with the visual control's `checked` state.
- Use the matching role: `checkbox` for independent selections, `radio` for a single choice within a set, and `switch` for immediate on/off settings.
- Wrap related radio rows in a `radiogroup` with an accessible name.
- For radio groups that need native radio keyboard behavior, keep native radio inputs or add arrow-key navigation in the parent group.
- When a row is disabled, disable the row and pass `disabled` to the presentation control so the visual state matches the interaction state.

### When Not to Use Presentation

Do not use `presentation` for a standalone control. A standalone `CheckBox`, `Radio`, or `Switch` should keep its native input so forms, keyboard interaction, focus indication, and assistive technology work without extra code.

Also avoid rendering a disabled visual control inside an enabled row. That communicates that the visible control is unavailable while the row still changes state, which is confusing.

## Reference

<AnatomyTable scope="item" />

<ApiTable component="ListItem" v-model="props" />

<StyleTokenTable component="ListItem" />
