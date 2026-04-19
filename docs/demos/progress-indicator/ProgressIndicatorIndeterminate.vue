<script setup lang="ts">
import { ProgressIndicator } from '@/components/ProgressIndicator';
</script>

<template>
  <div style="display: grid; gap: 1.5rem">
    <div style="display: grid; gap: 0.75rem">
      <div style="inline-size: min(100%, 18rem)">
        <ProgressIndicator behavior="indeterminate" />
      </div>
      <div style="inline-size: min(100%, 18rem)">
        <ProgressIndicator behavior="indeterminate" shape="wavy" />
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 2rem">
      <ProgressIndicator variant="circular" behavior="indeterminate" />
      <ProgressIndicator variant="circular" behavior="indeterminate" shape="wavy" />
    </div>
  </div>
</template>
