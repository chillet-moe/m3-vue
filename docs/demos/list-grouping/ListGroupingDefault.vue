<script setup lang="ts">
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div class="list-grouping-demo-stack">
    <div class="list-grouping-demo-group">
      <span class="list-grouping-demo-label">Rounded</span>
      <div class="list-grouping-demo-list" data-scope="list" data-part="container">
        <ListItem class="list-grouping-demo-item" title="Item 1" shape="rounded" />
        <ListItem class="list-grouping-demo-item" title="Item 2" shape="rounded" />
        <div class="list-grouping-demo-custom-item" data-list-group-item data-shape="rounded">Custom status row</div>
        <ListItem class="list-grouping-demo-item" title="Item 3" shape="rounded" active />
        <ListItem class="list-grouping-demo-item" title="Item 4" shape="rounded" />
      </div>
    </div>

    <div class="list-grouping-demo-group">
      <span class="list-grouping-demo-label">Square</span>
      <div class="list-grouping-demo-list" data-scope="list" data-part="container">
        <ListItem class="list-grouping-demo-item" title="Item 1" shape="square" />
        <ListItem class="list-grouping-demo-item" title="Item 2" shape="square" />
        <ListItem class="list-grouping-demo-item" title="Item 3" shape="square" active />
        <ListItem class="list-grouping-demo-item" title="Item 4" shape="square" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-grouping-demo-stack {
  display: grid;
  gap: --dp(16);
  inline-size: min(20rem, 100%);
}

.list-grouping-demo-group {
  display: grid;
  gap: --dp(4);
}

.list-grouping-demo-label {
  @apply label-large;

  padding-inline: 0.25rem;
  color: var(--md-sys-color-on-surface-variant);
}

.list-grouping-demo-list {
  display: grid;
  gap: --dp(2);
  inline-size: 100%;
  padding: 0.25rem;
  border-radius: var(--md-shape-card);
  background: var(--md-sys-color-surface-container-low);
}

.list-grouping-demo-item {
  --md-button-container-color: var(--md-sys-color-surface-container);
}

.list-grouping-demo-custom-item {
  padding: --dp(16);
  background: var(--md-sys-color-surface-container);
}
</style>
