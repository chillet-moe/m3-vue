<script setup lang="ts">
import { FloatingActionButton } from '@/components/FloatingActionButton';
</script>

<template>
  <div class="fab-demo-row">
    <FloatingActionButton icon="add">Create</FloatingActionButton>
    <FloatingActionButton>Compose</FloatingActionButton>
    <FloatingActionButton color="primary" icon="send">Send</FloatingActionButton>
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
