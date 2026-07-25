<script setup lang="ts">
import { Button } from '@/components/Button';

const variants = ['text', 'outlined', 'tonal', 'filled', 'elevated'] as const;
</script>

<template>
  <div class="button-demo-row">
    <Button v-for="variant in variants" :key="variant" :variant="variant" toggleable>
      <input type="checkbox" />
      {{ variant }}
    </Button>
  </div>
</template>

<style scoped>
.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
