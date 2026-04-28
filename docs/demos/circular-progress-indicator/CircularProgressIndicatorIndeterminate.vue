<script setup lang="ts">
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator';
</script>

<template>
  <div class="demo-circular-progress-indicator-row">
    <CircularProgressIndicator indeterminate aria-label="Loading" />
    <CircularProgressIndicator indeterminate direction="counterclockwise" aria-label="Loading counterclockwise" />
    <CircularProgressIndicator indeterminate shape="wavy" aria-label="Loading with wavy indicator" />
  </div>
</template>

<style scoped>
.demo-circular-progress-indicator-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
</style>
