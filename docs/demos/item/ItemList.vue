<script setup lang="ts">
import { Item } from '@/components/Item';
</script>

<template>
  <div class="item-demo-column">
    <Item title="Folder" leading-icon="folder" />
    <Item title="Drafts" leading-icon="drafts" trailing-icon="open_in_new" />
  </div>
</template>

<style scoped>
.item-demo-column {
  display: grid;
  inline-size: min(20rem, 100%);
}
</style>
