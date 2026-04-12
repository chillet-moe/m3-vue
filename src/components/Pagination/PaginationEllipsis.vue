<script setup lang="ts">
import { Icon } from '@/components/Icon';

export type PaginationEllipsisProps = {
  /** Accessible label announced for the collapsed pages marker. */
  label?: string;
};

const { label = 'More pages' } = defineProps<PaginationEllipsisProps>();
</script>

<template>
  <span class="m3-pagination-ellipsis" data-scope="pagination" data-part="ellipsis">
    <Icon
      name="more_horiz"
      class="m3-pagination-ellipsis-icon"
      data-scope="pagination"
      data-part="ellipsis-icon"
      aria-hidden="true"
    />
    <span class="m3-pagination-visually-hidden" data-scope="pagination" data-part="ellipsis-label">{{ label }}</span>
  </span>
</template>

<style src="./Pagination.css"></style>
