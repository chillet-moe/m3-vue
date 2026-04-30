<script setup lang="ts">
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from '@/components/FloatingActionButtonMenu';

const sizes = ['regular', 'medium', 'large'] as const;
</script>

<template>
  <div class="fab-menu-demo-row">
    <FloatingActionButtonMenu v-for="size in sizes" :key="size" :size="size" :aria-label="`${size} actions`">
      <FloatingActionButtonMenuItem icon="task_alt">{{ size }}</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem icon="schedule">Later</FloatingActionButtonMenuItem>
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
