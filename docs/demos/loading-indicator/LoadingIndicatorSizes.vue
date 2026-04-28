<script setup lang="ts">
import { LoadingIndicator } from '@/components/LoadingIndicator';
</script>

<template>
  <div class="demo-loading-indicator-sizes">
    <LoadingIndicator indicator-size="1.75rem" container-size="2.5rem" aria-label="Loading small content" />
    <LoadingIndicator aria-label="Loading content" />
    <LoadingIndicator
      variant="contained"
      indicator-size="3rem"
      container-width="4rem"
      container-height="4rem"
      aria-label="Loading large content"
    />
  </div>
</template>

<style scoped>
.demo-loading-indicator-sizes {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
