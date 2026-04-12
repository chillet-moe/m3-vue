<script setup lang="ts">
export type PaginationProps = {
  /** Accessible label for the pagination navigation landmark. */
  ariaLabel?: string;
};

const { ariaLabel = 'Pagination' } = defineProps<PaginationProps>();

defineSlots<{
  /** Pagination content, usually PaginationContent. */
  default(): any;
}>();
</script>

<template>
  <nav class="m3-pagination" role="navigation" data-scope="pagination" data-part="root" :aria-label="ariaLabel">
    <slot />
  </nav>
</template>

<style src="./Pagination.css"></style>
