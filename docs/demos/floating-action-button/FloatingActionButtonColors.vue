<script setup lang="ts">
import { FloatingActionButton } from '@/components/FloatingActionButton';

const colors = [
  'primary',
  'secondary',
  'tertiary',
  'primary-container',
  'secondary-container',
  'tertiary-container',
] as const;
</script>

<template>
  <div class="fab-demo-row">
    <FloatingActionButton v-for="color in colors" :key="color" :color="color" icon="palette">
      {{ color }}
    </FloatingActionButton>
  </div>
</template>

<style scoped>
.fab-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
</style>
