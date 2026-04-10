<script setup lang="ts">
import { Tooltip } from '@/components/Tooltip';
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
    <Tooltip variant="plain">Plain tooltip</Tooltip>
    <Tooltip variant="rich">Rich tooltip</Tooltip>
  </div>
</template>
