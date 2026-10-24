---
title: Breadcrumb
---

<script setup lang="ts">
import { ref } from 'vue';
import { Breadcrumb } from '@/components/Breadcrumb';

import BreadcrumbDefault from '../demos/breadcrumb/BreadcrumbDefault.vue';
import BreadcrumbDefaultSrc from '../demos/breadcrumb/BreadcrumbDefault.vue?raw';
import BreadcrumbCollapsed from '../demos/breadcrumb/BreadcrumbCollapsed.vue';
import BreadcrumbCollapsedSrc from '../demos/breadcrumb/BreadcrumbCollapsed.vue?raw';
import BreadcrumbCustomSeparator from '../demos/breadcrumb/BreadcrumbCustomSeparator.vue';
import BreadcrumbCustomSeparatorSrc from '../demos/breadcrumb/BreadcrumbCustomSeparator.vue?raw';
import BreadcrumbRouterLink from '../demos/breadcrumb/BreadcrumbRouterLink.vue';
import BreadcrumbRouterLinkSrc from '../demos/breadcrumb/BreadcrumbRouterLink.vue?raw';

const props = ref({
  ariaLabel: 'Breadcrumb',
  items: [
    { label: 'Docs', href: '#' },
    { label: 'Components', href: '#' },
    { label: 'Breadcrumb' },
  ],
});
</script>

# Breadcrumb

Breadcrumbs show the current page location within a navigational hierarchy.

<DemoContainer>
  <Breadcrumb v-bind="props" />
</DemoContainer>

## Examples

### Default

<DemoContainer :src="BreadcrumbDefaultSrc"><BreadcrumbDefault /></DemoContainer>

### Collapsed

<DemoContainer :src="BreadcrumbCollapsedSrc"><BreadcrumbCollapsed /></DemoContainer>

### Custom Separator

<DemoContainer :src="BreadcrumbCustomSeparatorSrc"><BreadcrumbCustomSeparator /></DemoContainer>

### Vue Router

Use `@item-click` to bridge item clicks into your router.

<DemoContainer :src="BreadcrumbRouterLinkSrc"><BreadcrumbRouterLink /></DemoContainer>

## Reference

<AnatomyTable scope="breadcrumb" />

### Breadcrumb

<ApiTable component="Breadcrumb" v-model="props" />

<StyleTokenTable component="Breadcrumb" />
