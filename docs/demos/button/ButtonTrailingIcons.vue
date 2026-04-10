<script setup lang="ts">
import { Button } from '@/components/Button';

const colors = ['elevated', 'filled', 'tonal', 'outlined', 'text'] as const;
const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
</script>

<template>
  <div class="button-demo-grid">
    <div v-for="size in sizes" :key="size" class="button-demo-row">
      <Button v-for="color in colors" :key="`${size}-${color}`" :color="color" :size="size" trailing-icon="favorite">
        {{ color }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.button-demo-grid {
  display: grid;
  gap: --dp(12);
}

.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: --dp(8);
}
</style>
