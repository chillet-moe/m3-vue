<script setup lang="ts">
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator';
</script>

<template>
  <div class="demo-circular-progress-indicator-row">
    <CircularProgressIndicator :value="0.24" aria-label="Download progress" />
    <CircularProgressIndicator :value="0.62" direction="counterclockwise" aria-label="Upload progress" />
    <CircularProgressIndicator :value="0.86" size="3rem" thickness="0.375rem" aria-label="Processing progress" />
    <CircularProgressIndicator :value="0.48" shape="wavy" aria-label="Wavy progress" />
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
