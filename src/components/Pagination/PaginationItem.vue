<script setup lang="ts">
defineSlots<{
  /** One pagination primitive, such as PaginationLink or PaginationEllipsis. */
  default(): any;
}>();
</script>

<template>
  <li class="m3-pagination-item" data-scope="pagination" data-part="item">
    <slot />
  </li>
</template>

<style src="./Pagination.css"></style>
