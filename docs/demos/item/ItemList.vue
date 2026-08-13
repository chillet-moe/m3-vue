<script setup lang="ts">
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div class="item-demo-list-stack">
    <div class="item-demo-list-group">
      <span class="item-demo-list-label">Rounded</span>
      <div class="item-demo-list" data-scope="list" data-part="container">
        <ListItem class="item-demo-list-item" title="Item 1" shape="rounded" />
        <ListItem class="item-demo-list-item" title="Item 2" shape="rounded" />
        <ListItem class="item-demo-list-item" title="Item 3" shape="rounded" />
        <div class="item-demo-custom-item" data-list-group-item data-shape="rounded">Custom status row</div>
        <ListItem class="item-demo-list-item" title="Item 4" shape="rounded" />
        <ListItem class="item-demo-list-item" title="Item 5" shape="rounded" leading-icon="settings" active />
        <ListItem class="item-demo-list-item" title="Item 6" shape="rounded" leading-icon="star" />
      </div>
    </div>

    <div class="item-demo-list-group">
      <span class="item-demo-list-label">Square</span>
      <div class="item-demo-list" data-scope="list" data-part="container">
        <ListItem class="item-demo-list-item" title="Item 1" shape="square" />
        <ListItem class="item-demo-list-item" title="Item 2" shape="square" />
        <ListItem class="item-demo-list-item" title="Item 3" shape="square" />
        <ListItem class="item-demo-list-item" title="Item 4" shape="square" />
        <ListItem class="item-demo-list-item" title="Item 5" shape="square" leading-icon="settings" active />
        <ListItem class="item-demo-list-item" title="Item 6" shape="square" leading-icon="star" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-demo-list-stack {
  display: grid;
  gap: --dp(16);
  inline-size: min(20rem, 100%);
}

.item-demo-list-group {
  display: grid;
  gap: --dp(4);
}

.item-demo-list-label {
  @apply label-large;

  padding-inline: 0.25rem;
  color: var(--md-sys-color-on-surface-variant);
}

.item-demo-list {
  display: grid;
  gap: --dp(2);
  inline-size: 100%;
  padding: 0.25rem;
  border-radius: var(--md-shape-card);
  background: var(--md-sys-color-surface-container-low);
}

.item-demo-list-item {
  --md-button-container-color: var(--md-sys-color-surface-container);
}

.item-demo-custom-item {
  padding: --dp(16);
  background: var(--md-sys-color-surface-container);
}
</style>
