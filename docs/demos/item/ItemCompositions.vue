<script setup lang="ts">
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div class="item-demo-column">
    <ListItem href="/components/button">
      <template #leading>
        <span class="item-demo-avatar">M3</span>
      </template>
      Library Overview
      <template #description>Open the Button docs page.</template>
      <template #trailing>
        <span class="item-demo-arrow">→</span>
      </template>
    </ListItem>

    <ListItem size="extra-small" leading-icon="sync">
      <template #header>Recent Sync</template>
      Local Cache
      <template #description>Synced 3 minutes ago.</template>
      <template #footer> Last source: docs registry </template>
    </ListItem>
  </div>
</template>

<style scoped>
.item-demo-column {
  display: grid;
  gap: 0.5rem;
  inline-size: min(34rem, 100%);
}

.item-demo-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border-radius: 999rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.item-demo-arrow {
  font-size: 1rem;
  line-height: 1;
}
</style>
