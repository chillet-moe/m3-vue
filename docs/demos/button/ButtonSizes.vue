<script setup lang="ts">
import { Button } from '@/components/Button';

const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
</script>

<template>
  <div class="button-demo-row">
    <Button v-for="size in sizes" :key="size" color="tonal" :size="size">
      {{ size }}
    </Button>
  </div>
</template>

<style scoped>
.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
</style>
