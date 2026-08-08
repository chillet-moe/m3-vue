---
title: ListItem
---

<script setup lang="ts">
import { ref } from 'vue';
import { ListItem } from '@/components/ListItem';

import ItemDefault from '../demos/item/ItemDefault.vue';
import ItemDefaultSrc from '../demos/item/ItemDefault.vue?raw';
import ItemList from '../demos/item/ItemList.vue';
import ItemListSrc from '../demos/item/ItemList.vue?raw';
import ItemCompositions from '../demos/item/ItemCompositions.vue';
import ItemCompositionsSrc from '../demos/item/ItemCompositions.vue?raw';
import ItemRouterLink from '../demos/item/ItemRouterLink.vue';
import ItemRouterLinkSrc from '../demos/item/ItemRouterLink.vue?raw';

const props = ref({
  shape: 'rounded',
  disabled: false,
  active: false,
  href: undefined,
  leadingIcon: 'person',
  trailingIcon: 'chevron_right',
  title: 'Profile',
  description: 'Manage your account settings.',
});
</script>

# ListItem

ListItem is a Button extension with richer content layout, suitable for interactive list entries and action rows.

<DemoContainer><ListItem v-bind="props" /></DemoContainer>

<AnatomyTable scope="item" />

<ApiTable component="ListItem" v-model="props" />

<StyleTokenTable component="ListItem" />

## List grouping

List grouping is a CSS behavior, not a component. Add the public `data-scope="list" data-part="container"` marker to
any element or custom component root that directly contains `ListItem` components:

```vue
<section class="settings-list" data-scope="list" data-part="container">
  <ListItem title="Account" />
  <ListItem title="Notifications" />
  <ListItem title="Privacy" />
</section>
```

With the default tokens, rounded middle items use an `8px` radius and the first/last rounded items use `24px` outer
corners. Square middle items use `4px`; square first/last items use `4px` on their inner corners and keep their own
square shape on the outer corners. The marker does not add a wrapper, layout, spacing, ARIA role, or menu semantics. Set
`display`, `gap`, width, and any list semantics on the container that you own. Nested grouping markers create separate
groups, and non-item direct children do not change which `ListItem` is first or last.

When the marker is placed on a Vue component, its root must receive fallthrough attributes. A single-root component
does this by default; components using `inheritAttrs: false` should forward `$attrs` to the grouping root.

The three `--md-list-group-*` tokens below are set on the grouping container. They apply to both the item surface and
its active indicator, so a selected or pressed middle item keeps its group shape. Square first/last items retain their
own shape, while square middle items use the `4px` group shape in every state. Square items do not count as rounded
group participants when determining which rounded item is first or last.

<StyleTokenTable component="ListItemGrouping" />

## Examples

### Default

<DemoContainer :src="ItemDefaultSrc"><ItemDefault /></DemoContainer>

### List

<DemoContainer :src="ItemListSrc"><ItemList /></DemoContainer>

### Compositions

<DemoContainer :src="ItemCompositionsSrc"><ItemCompositions /></DemoContainer>

### Vue Router

When `ListItem` is acting as navigation, use `RouterLink custom` and feed its `href` and `navigate` into the component.

<DemoContainer :src="ItemRouterLinkSrc"><ItemRouterLink /></DemoContainer>
