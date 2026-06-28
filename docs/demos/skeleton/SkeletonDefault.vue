<script setup lang="ts">
import { Skeleton } from '@/components/Skeleton';
</script>

<template>
  <div class="demo-skeleton-default">
    <Skeleton class="demo-skeleton-avatar" />
    <div class="demo-skeleton-content">
      <Skeleton class="demo-skeleton-title" />
      <Skeleton class="demo-skeleton-line" />
      <Skeleton class="demo-skeleton-line demo-skeleton-line-short" />
    </div>
  </div>
</template>

<style scoped>
.demo-skeleton-default {
  display: grid;
  grid-template-columns: auto minmax(12rem, 22rem);
  align-items: center;
  gap: 1rem;
}

.demo-skeleton-avatar {
  inline-size: 3.5rem;
  block-size: 3.5rem;
  border-radius: var(--md-sys-shape-corner-full);
}

.demo-skeleton-content {
  display: grid;
  gap: 0.625rem;
}

.demo-skeleton-title {
  block-size: 1.125rem;
  border-radius: var(--md-sys-shape-corner-full);
}

.demo-skeleton-line {
  block-size: 0.875rem;
  border-radius: var(--md-sys-shape-corner-full);
}

.demo-skeleton-line-short {
  inline-size: 72%;
}
</style>
