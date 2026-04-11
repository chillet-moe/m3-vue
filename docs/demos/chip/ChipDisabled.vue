<script setup lang="ts">
import { Chip } from '@/components/Chip';
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
    <Chip disabled>Assist</Chip>
    <Chip disabled :model-value="true">Selected</Chip>
  </div>
</template>
