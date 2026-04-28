<script setup lang="ts">
import { LinearProgressIndicator } from '@/components/LinearProgressIndicator';
</script>

<template>
  <div class="demo-linear-progress-indicator-stack">
    <LinearProgressIndicator indeterminate aria-label="Loading" />
    <LinearProgressIndicator indeterminate direction="rtl" aria-label="Loading right to left" />
    <LinearProgressIndicator indeterminate shape="wavy" aria-label="Loading with wavy indicator" />
  </div>
</template>

<style scoped>
.demo-linear-progress-indicator-stack {
  display: grid;
  gap: 1rem;
  inline-size: min(24rem, 100%);
}
</style>
