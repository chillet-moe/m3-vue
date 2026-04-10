<script setup lang="ts">
import { Card } from '@/components/Card';
</script>

<template>
  <Card
    clickable
    style="display: grid; gap: 0.5rem; inline-size: 15rem; min-block-size: 9rem; padding: 1rem; text-align: start;"
  >
    <strong>Repository sync</strong>
    <span>Open details about the latest sync status.</span>
  </Card>
</template>
