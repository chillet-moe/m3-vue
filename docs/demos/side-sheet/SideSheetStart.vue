<script setup lang="ts">
import { ref } from 'vue';
import { SideSheet } from '@/components/SideSheet';
import { Button } from '@/components/Button';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Open start sheet</Button>

  <SideSheet class="vp-raw" v-model:open="open" side="start" width="22rem">
    <template #headline>Navigation</template>
    Start-side sheets are useful for app-level navigation or persistent context.
  </SideSheet>
</template>
