<script setup lang="ts">
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from '@/components/FloatingActionButtonMenu';

const colors = ['primary', 'secondary', 'tertiary'] as const;
</script>

<template>
  <div class="fab-menu-demo-row">
    <FloatingActionButtonMenu v-for="color in colors" :key="color" :color="color" :aria-label="`${color} actions`">
      <FloatingActionButtonMenuItem icon="edit">Edit</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem icon="share">Share</FloatingActionButtonMenuItem>
    </FloatingActionButtonMenu>
  </div>
</template>

<style scoped>
.fab-menu-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  min-block-size: 12rem;
}
</style>
