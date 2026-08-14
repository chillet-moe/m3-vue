<script setup lang="ts">
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div class="list-grouping-shapes">
    <div class="list-grouping-shapes__list list-grouping-shapes__list--compact" data-scope="list" data-part="container">
      <span>Compact</span>
      <ListItem class="list-grouping-shapes__item" title="Overview" />
      <ListItem class="list-grouping-shapes__item" title="Activity" active />
      <ListItem class="list-grouping-shapes__item" title="Members" />
    </div>

    <div
      class="list-grouping-shapes__list list-grouping-shapes__list--expressive"
      data-scope="list"
      data-part="container"
    >
      <span>Expressive</span>
      <ListItem class="list-grouping-shapes__item" title="Overview" />
      <ListItem class="list-grouping-shapes__item" title="Activity" active />
      <ListItem class="list-grouping-shapes__item" title="Members" />
    </div>
  </div>
</template>

<style scoped>
.list-grouping-shapes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: --dp(20);
  inline-size: min(32rem, 100%);
}

.list-grouping-shapes__list {
  display: grid;
  gap: --dp(2);
}

.list-grouping-shapes__list > span {
  @apply label-large;

  padding: 0 --dp(8) --dp(4);
  color: var(--md-sys-color-on-surface-variant);
}

.list-grouping-shapes__list--compact {
  --md-list-group-item-shape: 0;
  --md-list-group-item-first-child-shape: --dp(12);
  --md-list-group-item-last-child-shape: --dp(12);
}

.list-grouping-shapes__list--expressive {
  --md-list-group-item-shape: --dp(16);
  --md-list-group-item-first-child-shape: --dp(32);
  --md-list-group-item-last-child-shape: --dp(32);
}

.list-grouping-shapes__item {
  --md-button-container-color: var(--md-sys-color-surface-container);
}
</style>
