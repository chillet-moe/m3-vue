<script setup lang="ts">
import { Button } from '@/components/Button';

const shapes = ['rounded', 'square'] as const;
</script>

<template>
  <div class="button-demo-row">
    <Button v-for="shape in shapes" :key="shape" variant="tonal" :shape="shape">
      {{ shape }}
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
