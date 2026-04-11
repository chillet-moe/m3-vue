<script setup lang="ts">
import { Card } from '@/components/Card';

const colors = ['elevated', 'filled', 'outlined'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
    <Card
      v-for="color in colors"
      :key="color"
      :color="color"
      style="display: grid; place-items: center; inline-size: 7.5rem; block-size: 6rem"
    >
      {{ color }}
    </Card>
  </div>
</template>
