<script setup>
import { ref } from 'vue';
import { NavigationDrawer, NavigationDrawerItem, NavigationDrawerSection } from '@/components/NavigationDrawer';

const value = ref('home');
const projectsExpanded = ref(true);
</script>

<template>
  <NavigationDrawer v-model="value" aria-label="Primary destinations" icon-only style="block-size: 24rem">
    <NavigationDrawerItem value="home" icon="home" label="Home" />
    <NavigationDrawerItem value="inbox" icon="inbox" label="Inbox" />
    <NavigationDrawerSection v-model:expanded="projectsExpanded" icon="folder" label="Projects">
      <NavigationDrawerItem value="active" icon="task_alt" label="Active" />
      <NavigationDrawerItem value="archived" icon="archive" label="Archived" />
    </NavigationDrawerSection>
    <NavigationDrawerItem value="settings" icon="settings" label="Settings" />
  </NavigationDrawer>
</template>
