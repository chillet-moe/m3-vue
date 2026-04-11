<script setup lang="ts">
import { IconButton } from '@/components/IconButton';

const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem">
    <IconButton v-for="size in sizes" :key="size" :size="size" color="tonal" icon="favorite" />
  </div>
</template>
