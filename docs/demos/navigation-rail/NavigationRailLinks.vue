<script setup>
import { ref } from 'vue';
import { NavigationRail, NavigationRailItem } from '@/components/NavigationRail';

const value = ref('inbox');
</script>

<template>
  <NavigationRail v-model="value" aria-label="Mailbox navigation" style="block-size: 24rem">
    <NavigationRailItem value="inbox" href="#inbox" icon="inbox" label="Inbox" />
    <NavigationRailItem value="drafts" href="#drafts" icon="draft" label="Drafts" />
    <NavigationRailItem value="sent" href="#sent" icon="send" label="Sent" />
    <NavigationRailItem value="archive" href="#archive" icon="archive" label="Archive" />
  </NavigationRail>
</template>
