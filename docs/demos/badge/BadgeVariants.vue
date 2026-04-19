<script setup lang="ts">
import { Badge } from '@/components/Badge';
</script>

<template>
  <div style="display: flex; align-items: center; gap: 0.75rem">
    <Badge />
    <Badge variant="large" :content="3" />
  </div>
</template>
