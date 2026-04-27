<script setup lang="ts">
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
</script>

<template>
  <div style="display: inline-flex; align-items: stretch; gap: 0.75rem">
    <Button color="text">Cancel</Button>
    <Divider orientation="vertical" />
    <Button color="text">Save</Button>
  </div>
</template>
