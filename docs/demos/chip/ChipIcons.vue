<script setup lang="ts">
import { Chip } from '@/components/Chip';
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
    <Chip leading-icon="settings">Leading icon</Chip>
    <Chip trailing-icon="close" :model-value="true">Trailing icon</Chip>
  </div>
</template>
