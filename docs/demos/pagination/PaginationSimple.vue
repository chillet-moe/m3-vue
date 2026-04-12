<script setup lang="ts">
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/Pagination';
</script>

<template>
  <Pagination>
    <PaginationContent>
      <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
      <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
      <PaginationItem><PaginationLink href="#" :is-active="true">3</PaginationLink></PaginationItem>
      <PaginationItem><PaginationLink href="#">4</PaginationLink></PaginationItem>
      <PaginationItem><PaginationLink href="#">5</PaginationLink></PaginationItem>
    </PaginationContent>
  </Pagination>
</template>
