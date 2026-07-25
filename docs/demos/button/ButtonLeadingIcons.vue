<script setup lang="ts">
import { Button } from '@/components/Button';

const variants = ['text', 'outlined', 'tonal', 'filled', 'elevated'] as const;
const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
</script>

<template>
  <div class="button-demo-grid">
    <div v-for="size in sizes" :key="size" class="button-demo-row">
      <Button
        v-for="variant in variants"
        :key="`${size}-${variant}`"
        :variant="variant"
        :size="size"
        leading-icon="settings"
      >
        {{ variant }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.button-demo-grid {
  display: grid;
  gap: 0.75rem;
}

.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
</style>
