<script setup lang="ts">
import { IconButton } from '@/components/IconButton';

const widths = ['default', 'narrow', 'wide'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
    <IconButton v-for="width in widths" :key="width" :width="width" color="tonal" icon="favorite" />
  </div>
</template>
