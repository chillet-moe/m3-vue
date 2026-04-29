<script setup lang="ts">
import { Icon } from '@/components/Icon';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem">
    <Icon name="settings" size="24px" />
    <Icon name="settings" weight="500" />

    <span style="font-weight: 600">
      Inline variant that follows font weight
      <Icon name="settings" variant="inline" />
    </span>
  </div>
</template>
