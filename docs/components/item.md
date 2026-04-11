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

const props = ref({
  variant: 'default',
  size: 'default',
  disabled: false,
  clickable: true,
  active: false,
  href: undefined,
  mediaIcon: 'person',
  actionIcon: 'chevron_right',
  title: 'Profile',
  description: 'Manage your account settings.',
});
</script>

# Item

Item is a flexible row-like surface inspired by shadcn Item, suitable for interactive list entries and richer button-like actions.

<DemoContainer><Item v-bind="props" /></DemoContainer>

<AnatomyTable scope="item" />

<ApiTable component="Item" v-model="props" />

## Examples

### Default

<DemoContainer :src="ItemDefaultSrc"><ItemDefault /></DemoContainer>

### Variants

<DemoContainer :src="ItemVariantsSrc"><ItemVariants /></DemoContainer>

### Compositions

<DemoContainer :src="ItemCompositionsSrc"><ItemCompositions /></DemoContainer>
