<script setup lang="ts">
import { Item } from '@/components/Item';
</script>

<template>
  <div class="item-demo-column">
    <Item
      variant="default"
      title="Default Variant"
      description="Standard styling with a filled surface."
      media-icon="folder"
      action-icon="chevron_right"
    />
    <Item
      variant="outline"
      title="Outline Variant"
      description="Outlined surface with transparent background."
      media-icon="drafts"
      action-icon="open_in_new"
    />
    <Item
      variant="muted"
      title="Muted Variant"
      description="Low-contrast styling for secondary content."
      media-icon="history"
      action-icon="more_horiz"
    />
  </div>
</template>

<style scoped>
.item-demo-column {
  display: grid;
  gap: 0.5rem;
  inline-size: min(34rem, 100%);
}
</style>
