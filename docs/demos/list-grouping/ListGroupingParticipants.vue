<script setup lang="ts">
import { Icon } from '@/components/Icon';
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div class="list-grouping-participants" data-scope="list" data-part="container">
    <ListItem
      class="list-grouping-participants__item"
      title="Storage"
      description="18 GB of 64 GB used"
      leading-icon="hard_drive"
      :interactive="false"
    />

    <article class="list-grouping-participants__status" data-list-group-item data-shape="rounded">
      <Icon name="cloud_done" />
      <span>
        <strong>Cloud backup</strong>
        <small>Completed 2 minutes ago</small>
      </span>
    </article>

    <ListItem
      class="list-grouping-participants__item"
      title="Manage storage"
      leading-icon="settings"
      trailing-icon="chevron_right"
    />
  </div>
</template>

<style scoped>
.list-grouping-participants {
  display: grid;
  gap: --dp(2);
  inline-size: min(22rem, 100%);
}

.list-grouping-participants__item {
  --md-button-container-color: var(--md-sys-color-surface-container);
}

.list-grouping-participants__item[data-interactive='false'] {
  background: var(--md-sys-color-surface-container);
}

.list-grouping-participants__status {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: --dp(20);
  min-block-size: --dp(56);
  padding: --dp(12) --dp(16);
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container);

  --md-icon-size: --dp(24);
}

.list-grouping-participants__status span {
  display: grid;
  gap: --dp(2);
}

.list-grouping-participants__status strong {
  @apply body-large;
}

.list-grouping-participants__status small {
  @apply body-medium;

  color: var(--md-sys-color-on-surface-variant);
}
</style>
