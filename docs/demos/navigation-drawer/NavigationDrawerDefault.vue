<script setup>
import { ref } from 'vue';
import { NavigationDrawer, NavigationDrawerItem, NavigationDrawerSection } from '@/components/NavigationDrawer';

const value = ref('home');
</script>

<template>
  <NavigationDrawer v-model="value" aria-label="Primary destinations" icon-space="root" style="block-size: 30rem">
    <NavigationDrawerItem value="home" icon="home" label="Home" />
    <NavigationDrawerItem value="inbox" icon="inbox" label="Inbox" />
    <NavigationDrawerSection icon="folder" label="Projects">
      <NavigationDrawerItem value="active" icon="task_alt" label="Active" />
      <NavigationDrawerItem value="archived" icon="archive" label="Archived" />
    </NavigationDrawerSection>
    <NavigationDrawerSection icon="groups" label="Teams">
      <NavigationDrawerItem value="design" icon="palette" label="Design" />
      <NavigationDrawerItem value="engineering" icon="engineering" label="Engineering" />
    </NavigationDrawerSection>
    <NavigationDrawerSection icon="list" label="Plain">
      <NavigationDrawerItem value="drafts" icon="draft" label="Drafts" />
      <NavigationDrawerItem value="sent" icon="send" label="Sent" />
    </NavigationDrawerSection>
    <NavigationDrawerItem value="settings" icon="settings" label="Settings" />
  </NavigationDrawer>
</template>
