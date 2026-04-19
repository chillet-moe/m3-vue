<script setup lang="ts">
import { ProgressIndicator } from '@/components/ProgressIndicator';

const shapes = ['flat', 'wavy'] as const;
</script>

<template>
  <div style="display: grid; gap: 1.5rem">
    <div v-for="shape in shapes" :key="shape" style="display: flex; flex-wrap: wrap; align-items: center; gap: 2rem">
      <div style="display: grid; gap: 0.5rem; inline-size: min(100%, 18rem)">
        <div style="font-size: 0.75rem; opacity: 0.72">{{ shape }}</div>
        <ProgressIndicator :shape="shape" :value="62" />
      </div>
      <div style="display: grid; gap: 0.5rem; justify-items: start">
        <div style="font-size: 0.75rem; opacity: 0.72">{{ shape }}</div>
        <ProgressIndicator variant="circular" :shape="shape" :value="62" />
      </div>
    </div>
  </div>
</template>
