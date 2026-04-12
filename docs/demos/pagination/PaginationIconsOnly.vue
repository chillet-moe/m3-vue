<script setup lang="ts">
import { ref } from 'vue';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/Pagination';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';

const rowsPerPage = ref<SelectModelValue>(10);

const rowsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];
</script>

<template>
  <div class="pagination-icons-only-demo">
    <Pagination aria-label="Table pages">
      <PaginationContent>
        <div class="pagination-icons-only-rows">
          <span class="pagination-icons-only-label">Rows per page</span>
          <Select
            class="pagination-icons-only-select"
            v-model="rowsPerPage"
            :options="rowsPerPageOptions"
            aria-label="Rows per page"
          />
        </div>

        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
</template>

<style scoped>
.pagination-icons-only-demo {
  display: flex;
  align-items: center;
}

.pagination-icons-only-rows {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-icons-only-label {
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant);
}

:deep([data-scope='text-field'][data-part='container']) {
  inline-size: 6rem;
}
</style>
<style></style>
