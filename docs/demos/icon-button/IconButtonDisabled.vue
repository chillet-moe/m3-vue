<script setup lang="ts">
import { IconButton } from '@/components/IconButton';

const variants = ['standard', 'outlined', 'tonal', 'filled'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
    <IconButton v-for="variant in variants" :key="variant" :variant="variant" disabled icon="favorite" />
  </div>
</template>
