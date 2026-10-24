<script setup lang="ts">
import { useOverlays } from '@/overlays';
const { showDialog } = useOverlays();
import { ref } from 'vue';
import { Button } from '@/components/Button';

const result = ref('');

async function openDialog() {
  result.value = await showDialog({
    headline: 'Delete file?',
    content: 'This action cannot be undone.',
    actions: [
      { label: 'Cancel', value: 'cancel' },
      { label: 'Delete', value: 'confirm' },
    ],
  });
}
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 1rem">
    <Button @click="openDialog">Open with showDialog()</Button>
    <div v-if="result">Result: {{ result }}</div>
  </div>
</template>
