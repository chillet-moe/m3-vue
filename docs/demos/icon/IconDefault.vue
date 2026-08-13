<script setup lang="ts">
import { Icon } from '@/components/Icon';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem">
    <span style="font-size: 16px">
      Standalone icon defaults to 24px
      <Icon name="settings" />
    </span>

    <Icon name="settings" weight="500" />

    <span style="font-size: 16px; font-weight: 600">
      Inline variant follows text size and weight
      <Icon name="settings" variant="inline" />
    </span>
  </div>
</template>
