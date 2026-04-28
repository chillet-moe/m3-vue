<script setup lang="ts">
import { LoadingIndicator } from '@/components/LoadingIndicator';
</script>

<template>
  <div class="demo-loading-indicator-contained">
    <LoadingIndicator variant="contained" aria-label="Loading" />
    <LoadingIndicator class="demo-loading-indicator-tertiary" variant="contained" aria-label="Saving" />
  </div>
</template>

<style scoped>
.demo-loading-indicator-contained {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.demo-loading-indicator-tertiary {
  --md-color-container: var(--md-sys-color-tertiary-container);
  --md-color-on-container: var(--md-sys-color-on-tertiary-container);
}
</style>
