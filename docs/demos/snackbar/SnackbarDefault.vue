<script setup lang="ts">
import { ref } from 'vue';
import { Snackbar } from '@/components/Snackbar';

const lastEvent = ref('');
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; inline-size: min(36rem, 100%);">
    <Snackbar
      action-label="Undo"
      dismissible
      @action="lastEvent = 'action'"
      @dismiss="lastEvent = 'dismiss'"
    >
      Message archived
    </Snackbar>
    <div v-if="lastEvent">Last event: {{ lastEvent }}</div>
  </div>
</template>
