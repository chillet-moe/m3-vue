<script setup lang="ts">
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from '@/components/FloatingActionButtonMenu';
</script>

<template>
  <FloatingActionButtonMenu aria-label="Create">
    <FloatingActionButtonMenuItem icon="mail">Message</FloatingActionButtonMenuItem>
    <FloatingActionButtonMenuItem icon="event">Event</FloatingActionButtonMenuItem>
    <FloatingActionButtonMenuItem icon="photo_camera">Photo</FloatingActionButtonMenuItem>
  </FloatingActionButtonMenu>
</template>
