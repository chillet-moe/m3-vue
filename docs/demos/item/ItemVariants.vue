<script setup lang="ts">
import { Item } from '@/components/Item';
</script>

<template>
  <div class="item-demo-column">
    <Item
      color="text"
      size="small"
      title="Filled / Small"
      description="Uses Button color and size tokens."
      leading-icon="folder"
      trailing-icon="chevron_right"
    />
    <Item
      color="outlined"
      size="medium"
      title="Outlined / Medium"
      description="Same API as Button, with Item content layout."
      leading-icon="drafts"
      trailing-icon="open_in_new"
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
