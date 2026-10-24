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
</script>

# ListItem

ListItem provides a rich list-entry layout. It is interactive by default and renders as a button, or as an anchor when
`href` is set. Set `interactive="false"` for a passive information row or a row whose nested control owns the
interaction; passive items render as `div` elements without button, link, focus, state-layer, or press behavior. Any
`href` is ignored while the item is passive.

<DemoContainer><ListItem v-bind="props" /></DemoContainer>

<AnatomyTable scope="item" />

<ApiTable component="ListItem" v-model="props" />

<StyleTokenTable component="ListItem" />

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

`appearance="standard"` is the default: a fixed whole-row active indicator, compact corners, and no expanding highlight or press shape morph. `appearance="expressive"` retains the expanding indicator and press morph. Appearance does not change button/link/presentation semantics, slots, or layout tokens.

<DemoContainer :src="ItemAppearancesSrc"><ItemAppearances /></DemoContainer>

Set `appearance="expressive"` on existing items to retain the previous appearance. The `shape` prop controls the expressive shape; standard uses `--md-shape-compact`. `--md-item-indicator-shape` can customize the indicator in either appearance.

Use [SelectItem](./select#selectitem) for selection options and [MenuItem](./menu) for menu commands. ListItem remains a general list entry. See [Styling](../guides/styling) for appearance and density choices.
