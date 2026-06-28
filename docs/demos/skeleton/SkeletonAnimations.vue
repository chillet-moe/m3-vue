<script setup lang="ts">
import { Skeleton } from '@/components/Skeleton';
</script>

<template>
  <div class="demo-skeleton-animations">
    <div class="demo-skeleton-animation">
      <span>Pulse</span>
      <Skeleton animation="pulse" class="demo-skeleton-bar" />
    </div>
    <div class="demo-skeleton-animation">
      <span>Wave</span>
      <Skeleton animation="wave" class="demo-skeleton-bar" />
    </div>
    <div class="demo-skeleton-animation">
      <span>None</span>
      <Skeleton animation="none" class="demo-skeleton-bar" />
    </div>
  </div>
</template>

<style scoped>
.demo-skeleton-animations {
  display: grid;
  gap: 0.875rem;
  min-inline-size: min(100%, 22rem);
}

.demo-skeleton-animation {
  display: grid;
  grid-template-columns: 4rem minmax(10rem, 1fr);
  align-items: center;
  gap: 1rem;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-medium);
}

.demo-skeleton-bar {
  block-size: 1rem;
  border-radius: var(--md-sys-shape-corner-full);
}
</style>
