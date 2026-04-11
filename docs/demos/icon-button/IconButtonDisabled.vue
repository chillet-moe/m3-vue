<script setup lang="ts">
import { IconButton } from '@/components/IconButton';

const colors = ['filled', 'tonal', 'outlined', 'standard'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
    <IconButton v-for="color in colors" :key="color" :color="color" disabled icon="favorite" />
  </div>
</template>
