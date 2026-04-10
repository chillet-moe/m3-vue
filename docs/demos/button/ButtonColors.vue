<script setup lang="ts">
import { Button } from '@/components/Button';

const colors = ['elevated', 'filled', 'tonal', 'outlined', 'text'] as const;
</script>

<template>
  <div class="button-demo-row">
    <Button v-for="color in colors" :key="color" :color="color">
      {{ color }}
    </Button>
  </div>
</template>

<style scoped>
.button-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: --dp(8);
}
</style>
