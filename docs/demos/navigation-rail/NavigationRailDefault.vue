<script setup>
import { ref } from 'vue';
import { NavigationRail, NavigationRailItem } from '@/components/NavigationRail';

const value = ref('home');
</script>

<template>
  <NavigationRail v-model="value" aria-label="Primary destinations" style="block-size: 28rem">
    <NavigationRailItem value="home" icon="home" label="Home" />
    <NavigationRailItem value="bookmarks" icon="bookmark" label="Saved" />
    <NavigationRailItem value="folder" icon="folder" label="Files" />
    <NavigationRailItem value="settings" icon="settings" label="Settings" />
  </NavigationRail>
</template>
