<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from '@/components/FloatingActionButtonMenu';

const open = ref(false);
</script>

<template>
  <div class="fab-menu-demo-column">
    <div class="fab-menu-demo-row">
      <Button size="small" @click="open = !open">
        {{ open ? 'Close' : 'Open' }}
      </Button>
      <Button size="small" color="tonal" @click="open = false">Reset</Button>
    </div>

    <FloatingActionButtonMenu v-model:open="open" color="tertiary" aria-label="Controlled actions">
      <FloatingActionButtonMenuItem icon="star">Star</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem icon="label">Label</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem icon="notifications">Notify</FloatingActionButtonMenuItem>
    </FloatingActionButtonMenu>
  </div>
</template>

<style scoped>
.fab-menu-demo-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
  min-block-size: 12rem;
}

.fab-menu-demo-row {
  display: flex;
  gap: 0.5rem;
}
</style>
