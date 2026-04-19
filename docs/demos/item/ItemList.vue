<script setup lang="ts">
import { Item } from '@/components/Item';
</script>

<template>
  <div class="item-demo-column">
    <Item title="Item 1" />
    <Item title="Item 2" />
    <Item title="Item 3" />
    <Item title="Item 4" />
    <Item title="Item 5" />
    <Item title="Item 6" />
  </div>
</template>

<style scoped>
.item-demo-column {
  display: grid;
  inline-size: min(20rem, 100%);
}
</style>
