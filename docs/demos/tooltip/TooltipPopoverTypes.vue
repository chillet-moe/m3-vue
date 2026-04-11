<script setup lang="ts">
import { Tooltip } from '@/components/Tooltip';

const popovers = ['auto', 'hint', 'manual'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
    <Tooltip v-for="popover in popovers" :key="popover" :popover="popover">
      {{ popover }}
    </Tooltip>
  </div>
</template>
