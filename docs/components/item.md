---
title: Item
---

<script setup lang="ts">
import { ref } from 'vue';
import { Item } from '@/components/Item';

import ItemDefault from '../demos/item/ItemDefault.vue';
import ItemDefaultSrc from '../demos/item/ItemDefault.vue?raw';
import ItemVariants from '../demos/item/ItemVariants.vue';
import ItemVariantsSrc from '../demos/item/ItemVariants.vue?raw';
import ItemCompositions from '../demos/item/ItemCompositions.vue';
import ItemCompositionsSrc from '../demos/item/ItemCompositions.vue?raw';
import ItemRouterLink from '../demos/item/ItemRouterLink.vue';
import ItemRouterLinkSrc from '../demos/item/ItemRouterLink.vue?raw';

const props = ref({
  color: 'text',
  size: 'small',
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

# Item

Item is a Button extension with richer content layout, suitable for interactive list entries and action rows.

<DemoContainer><Item v-bind="props" /></DemoContainer>

<AnatomyTable scope="item" />

<ApiTable component="Item" v-model="props" />

## Examples

### Default

<DemoContainer :src="ItemDefaultSrc"><ItemDefault /></DemoContainer>

### Colors & Sizes

<DemoContainer :src="ItemVariantsSrc"><ItemVariants /></DemoContainer>

### Compositions

<DemoContainer :src="ItemCompositionsSrc"><ItemCompositions /></DemoContainer>

### Vue Router

When `Item` is acting as navigation, use `RouterLink custom` and feed its `href` and `navigate` into the component.

<DemoContainer :src="ItemRouterLinkSrc"><ItemRouterLink /></DemoContainer>
