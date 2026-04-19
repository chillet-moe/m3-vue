<script setup lang="ts">
import { ProgressIndicator } from '@/components/ProgressIndicator';
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 2rem">
    <div style="inline-size: min(100%, 18rem)">
      <ProgressIndicator :value="62" />
    </div>
    <ProgressIndicator variant="circular" :value="62" />
  </div>
</template>
