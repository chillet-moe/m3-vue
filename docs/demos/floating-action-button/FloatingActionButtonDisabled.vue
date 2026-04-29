<script setup lang="ts">
import { FloatingActionButton } from '@/components/FloatingActionButton';
</script>

<template>
  <div class="fab-demo-row">
    <FloatingActionButton icon="edit" disabled aria-label="Edit" />
    <FloatingActionButton icon="add" disabled>Create</FloatingActionButton>
    <FloatingActionButton href="/blocked" icon="open_in_new" disabled>Disabled link</FloatingActionButton>
  </div>
</template>

<style scoped>
.fab-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
</style>
