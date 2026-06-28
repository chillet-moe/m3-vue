<script setup lang="ts">
import { Skeleton } from '@/components/Skeleton';
</script>

<template>
  <div class="demo-skeleton-shapes">
    <Skeleton class="demo-skeleton-circle" />
    <Skeleton class="demo-skeleton-pill" />
    <Skeleton class="demo-skeleton-card" />
  </div>
</template>

<style scoped>
.demo-skeleton-shapes {
  display: grid;
  grid-template-columns: auto minmax(8rem, 14rem) minmax(10rem, 16rem);
  align-items: center;
  gap: 1rem;
}

.demo-skeleton-circle {
  inline-size: 4rem;
  block-size: 4rem;
  border-radius: var(--md-sys-shape-corner-full);
}

.demo-skeleton-pill {
  block-size: 2.25rem;
  border-radius: var(--md-sys-shape-corner-full);
}

.demo-skeleton-card {
  aspect-ratio: 16 / 10;
  block-size: auto;
  border-radius: var(--md-shape-card);
}
</style>
