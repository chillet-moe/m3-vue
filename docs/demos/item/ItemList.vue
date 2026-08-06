<script setup lang="ts">
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div class="item-demo-list" data-scope="list" data-part="container">
    <ListItem class="item-demo-list-item" title="Item 1" />
    <ListItem class="item-demo-list-item" title="Item 2" />
    <ListItem class="item-demo-list-item" title="Item 3" />
    <ListItem class="item-demo-list-item" title="Item 4" />
    <ListItem class="item-demo-list-item" title="Item 5" leading-icon="settings" active />
    <ListItem class="item-demo-list-item" title="Item 6" leading-icon="star" />
  </div>
</template>

<style scoped>
.item-demo-list {
  display: grid;
  gap: --dp(2);
  inline-size: min(20rem, 100%);
  padding: 0.25rem;
  border-radius: var(--md-shape-card);
  background: var(--md-sys-color-surface-container-low);
}

.item-demo-list-item {
  --md-button-container-color: var(--md-sys-color-surface-container);
}
</style>
