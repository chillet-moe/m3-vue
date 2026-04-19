<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { NavigationRail, NavigationRailItem } from '@/components/NavigationRail';

const value = ref('home');
const state = ref<'collapsed' | 'expanded'>('collapsed');

const toggleState = () => {
  state.value = state.value === 'collapsed' ? 'expanded' : 'collapsed';
};
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 1rem">
    <NavigationRail
      v-model="value"
      v-model:state="state"
      aria-label="Expandable navigation rail"
      style="block-size: 28rem"
    >
      <template #leading>Leading slot</template>
      <template #trailing>Trailing slot</template>

      <NavigationRailItem value="home" icon="home" label="Home" />
      <NavigationRailItem value="inbox" icon="inbox" label="Inbox" />
      <NavigationRailItem value="bookmarks" icon="bookmark" label="Saved" />
      <NavigationRailItem value="settings" icon="settings" label="Settings" />
    </NavigationRail>
    <Button @click="toggleState">Switch to {{ state === 'collapsed' ? 'expanded' : 'collapsed' }}</Button>
  </div>
</template>
