---
title: 面包屑
---

<script setup lang="ts">
import { ref } from 'vue';
import { Breadcrumb } from '@/components/Breadcrumb';

import BreadcrumbDefault from '../../demos/breadcrumb/BreadcrumbDefault.vue';
import BreadcrumbDefaultSrc from '../../demos/breadcrumb/BreadcrumbDefault.vue?raw';
import BreadcrumbCollapsed from '../../demos/breadcrumb/BreadcrumbCollapsed.vue';
import BreadcrumbCollapsedSrc from '../../demos/breadcrumb/BreadcrumbCollapsed.vue?raw';
import BreadcrumbCustomSeparator from '../../demos/breadcrumb/BreadcrumbCustomSeparator.vue';
import BreadcrumbCustomSeparatorSrc from '../../demos/breadcrumb/BreadcrumbCustomSeparator.vue?raw';
import BreadcrumbRouterLink from '../../demos/breadcrumb/BreadcrumbRouterLink.vue';
import BreadcrumbRouterLinkSrc from '../../demos/breadcrumb/BreadcrumbRouterLink.vue?raw';

const props = ref({
  ariaLabel: 'Breadcrumb',
  items: [
    { label: 'Docs', href: '#' },
    { label: 'Components', href: '#' },
    { label: 'Breadcrumb' },
  ],
});
</script>

# 面包屑

面包屑用于显示当前页面在导航层级中的位置。

<DemoContainer>
  <Breadcrumb v-bind="props" />
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="BreadcrumbDefaultSrc"><BreadcrumbDefault /></DemoContainer>

### 折叠显示

<DemoContainer :src="BreadcrumbCollapsedSrc"><BreadcrumbCollapsed /></DemoContainer>

### 自定义分隔符

<DemoContainer :src="BreadcrumbCustomSeparatorSrc"><BreadcrumbCustomSeparator /></DemoContainer>

### Vue Router

使用 `@item-click` 将条目点击事件接入路由器。

<DemoContainer :src="BreadcrumbRouterLinkSrc"><BreadcrumbRouterLink /></DemoContainer>

## 参考

<AnatomyTable scope="breadcrumb" />

### Breadcrumb

<ApiTable component="Breadcrumb" v-model="props" />

<StyleTokenTable component="Breadcrumb" />
