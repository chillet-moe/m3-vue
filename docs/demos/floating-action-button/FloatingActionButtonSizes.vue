<script setup lang="ts">
import { FloatingActionButton } from '@/components/FloatingActionButton';

const sizes = ['regular', 'medium', 'large'] as const;
</script>

<template>
  <div class="fab-demo-column">
    <div class="fab-demo-row">
      <FloatingActionButton v-for="size in sizes" :key="size" :size="size" icon="edit" :aria-label="size" />
    </div>
    <div class="fab-demo-row">
      <FloatingActionButton v-for="size in sizes" :key="size" :size="size" icon="add">
        {{ size }}
      </FloatingActionButton>
    </div>
  </div>
</template>

<style scoped>
.fab-demo-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fab-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
</style>
