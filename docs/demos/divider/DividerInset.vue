<script setup lang="ts">
import { Divider } from '@/components/Divider';
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <div style="display: grid; inline-size: min(100%, 22rem)">
    <ListItem leading-icon="person" title="Profile" />
    <Divider inset="start" />
    <ListItem leading-icon="settings" title="Settings" />
  </div>
</template>
