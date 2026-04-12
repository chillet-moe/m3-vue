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

import PaginationDefault from '../demos/pagination/PaginationDefault.vue';
import PaginationDefaultSrc from '../demos/pagination/PaginationDefault.vue?raw';
import PaginationSimple from '../demos/pagination/PaginationSimple.vue';
import PaginationSimpleSrc from '../demos/pagination/PaginationSimple.vue?raw';
import PaginationIconsOnly from '../demos/pagination/PaginationIconsOnly.vue';
import PaginationIconsOnlySrc from '../demos/pagination/PaginationIconsOnly.vue?raw';

const props = ref({
  ariaLabel: 'Pagination',
});
</script>

# Pagination

Pagination provides a composable page-navigation pattern with previous/next helpers, page links, and an ellipsis marker.

<DemoContainer><Pagination v-bind="props"><PaginationContent><PaginationItem><PaginationPrevious href="#" /></PaginationItem><PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#" :is-active="true">2</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationNext href="#" /></PaginationItem></PaginationContent></Pagination></DemoContainer>

<AnatomyTable scope="pagination" />

## API

### Pagination

<ApiTable component="Pagination" v-model="props" />

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

## Examples

### Default

<DemoContainer :src="PaginationDefaultSrc"><PaginationDefault /></DemoContainer>

### Simple

<DemoContainer :src="PaginationSimpleSrc"><PaginationSimple /></DemoContainer>

### Icons Only

<DemoContainer :src="PaginationIconsOnlySrc"><PaginationIconsOnly /></DemoContainer>
