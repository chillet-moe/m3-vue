<script setup lang="ts">
defineSlots<{
  /** Pagination items. */
  default(): any;
}>();
</script>

<template>
  <ul class="m3-pagination-content" data-scope="pagination" data-part="content">
    <slot />
  </ul>
</template>

<style src="./Pagination.css"></style>
