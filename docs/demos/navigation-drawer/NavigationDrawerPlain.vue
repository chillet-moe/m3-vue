<script setup>
import { ref } from 'vue';
import { NavigationDrawer, NavigationDrawerItem, NavigationDrawerSection } from '@/components/NavigationDrawer';

const value = ref('home');
</script>

<template>
  <NavigationDrawer v-model="value" aria-label="Plain destinations" style="block-size: 24rem">
    <NavigationDrawerItem value="home" label="Home" />
    <NavigationDrawerItem value="inbox" label="Inbox" />
    <NavigationDrawerSection label="Projects">
      <NavigationDrawerItem value="active" label="Active" />
      <NavigationDrawerItem value="archived" label="Archived" />
    </NavigationDrawerSection>
    <NavigationDrawerItem value="settings" label="Settings" />
  </NavigationDrawer>
</template>
