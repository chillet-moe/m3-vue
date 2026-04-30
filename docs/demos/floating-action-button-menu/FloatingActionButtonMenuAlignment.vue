<script setup lang="ts">
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from '@/components/FloatingActionButtonMenu';
</script>

<template>
  <div class="fab-menu-demo-row">
    <FloatingActionButtonMenu alignment="start" aria-label="Open start aligned actions">
      <FloatingActionButtonMenuItem href="#reply" icon="reply">Reply</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem href="#forward" icon="forward">Forward</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem icon="archive" :close-on-select="false">Archive later</FloatingActionButtonMenuItem>
    </FloatingActionButtonMenu>

    <FloatingActionButtonMenu aria-label="Open end aligned actions">
      <FloatingActionButtonMenuItem icon="content_copy">Copy</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem icon="drive_file_rename_outline">Rename</FloatingActionButtonMenuItem>
      <FloatingActionButtonMenuItem icon="delete" disabled>Delete</FloatingActionButtonMenuItem>
    </FloatingActionButtonMenu>
  </div>
</template>

<style scoped>
.fab-menu-demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-block-size: 12rem;
  inline-size: min(30rem, 100%);
}
</style>
