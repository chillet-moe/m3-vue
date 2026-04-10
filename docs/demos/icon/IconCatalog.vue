<script setup lang="ts">
import { Icon } from '@/components/Icon';

const icons = ['favorite', 'home', 'search', 'settings'] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
    <div
      v-for="icon in icons"
      :key="icon"
      style="display: grid; justify-items: center; gap: 0.5rem; min-inline-size: 5rem;"
    >
      <Icon :name="icon" />
      <code>{{ icon }}</code>
    </div>
  </div>
</template>
