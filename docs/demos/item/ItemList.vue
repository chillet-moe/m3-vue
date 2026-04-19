<script setup lang="ts">
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div class="item-demo-column">
    <ListItem title="Item 1" />
    <ListItem title="Item 2" />
    <ListItem title="Item 3" />
    <ListItem title="Item 4" />
    <ListItem title="Item 5" leading-icon="settings" active />
    <ListItem title="Item 6" leading-icon="star" />
  </div>
</template>

<style scoped>
.item-demo-column {
  display: grid;
  inline-size: min(20rem, 100%);
}
</style>
