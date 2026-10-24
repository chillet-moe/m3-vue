---
title: Pagination
---

<script setup lang="ts">
import { ref } from 'vue';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/Pagination';

import PaginationDefault from '../../demos/pagination/PaginationDefault.vue';
import PaginationDefaultSrc from '../../demos/pagination/PaginationDefault.vue?raw';
import PaginationSimple from '../../demos/pagination/PaginationSimple.vue';
import PaginationSimpleSrc from '../../demos/pagination/PaginationSimple.vue?raw';
import PaginationIconsOnly from '../../demos/pagination/PaginationIconsOnly.vue';
import PaginationIconsOnlySrc from '../../demos/pagination/PaginationIconsOnly.vue?raw';
import PaginationRouterLink from '../../demos/pagination/PaginationRouterLink.vue';
import PaginationRouterLinkSrc from '../../demos/pagination/PaginationRouterLink.vue?raw';

const props = ref({
  ariaLabel: 'Pagination',
});
</script>

# Pagination

Pagination 提供可组合的分页导航模式，包含上一页/下一页辅助项、页码链接和省略标记。

<DemoContainer><Pagination v-bind="props"><PaginationContent><PaginationItem><PaginationPrevious href="#" /></PaginationItem><PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#" :is-active="true">2</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationNext href="#" /></PaginationItem></PaginationContent></Pagination></DemoContainer>

## 示例

### 默认

<DemoContainer :src="PaginationDefaultSrc"><PaginationDefault /></DemoContainer>

### 简单模式

<DemoContainer :src="PaginationSimpleSrc"><PaginationSimple /></DemoContainer>

### 仅图标

<DemoContainer :src="PaginationIconsOnlySrc"><PaginationIconsOnly /></DemoContainer>

### Vue Router

`PaginationLink`、`PaginationPrevious` 和 `PaginationNext` 使用相同模式：通过 `RouterLink custom` 获取 `href` 和 `navigate`，再将它们传给分页控件。

<DemoContainer :src="PaginationRouterLinkSrc"><PaginationRouterLink /></DemoContainer>

## 参考

<AnatomyTable scope="pagination" />

### Pagination

<ApiTable component="Pagination" v-model="props" />

<StyleTokenTable component="Pagination" />

### PaginationContent

<ApiTable component="PaginationContent" />

### PaginationItem

<ApiTable component="PaginationItem" />

### PaginationLink

<ApiTable component="PaginationLink" />

### PaginationPrevious

<ApiTable component="PaginationPrevious" />

### PaginationNext

<ApiTable component="PaginationNext" />

### PaginationEllipsis

<ApiTable component="PaginationEllipsis" />
