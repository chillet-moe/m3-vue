<script setup lang="ts">
import { IconButton } from '@/components/IconButton';

const shapes = ['rounded', 'square'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
    <IconButton v-for="shape in shapes" :key="shape" :shape="shape" color="tonal" icon="favorite" />
  </div>
</template>
