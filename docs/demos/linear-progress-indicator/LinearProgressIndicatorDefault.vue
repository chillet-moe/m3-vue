<script setup lang="ts">
import { LinearProgressIndicator } from '@/components/LinearProgressIndicator';
</script>

<template>
  <div class="demo-linear-progress-indicator-stack">
    <LinearProgressIndicator :value="0.24" aria-label="Download progress" />
    <LinearProgressIndicator :value="0.62" direction="rtl" aria-label="Upload progress" />
    <LinearProgressIndicator :value="0.86" thickness="0.5rem" track-gap="0.5rem" aria-label="Processing progress" />
    <LinearProgressIndicator :value="0.48" shape="wavy" aria-label="Wavy progress" />
  </div>
</template>

<style scoped>
.demo-linear-progress-indicator-stack {
  display: grid;
  gap: 1rem;
  inline-size: min(24rem, 100%);
}
</style>
