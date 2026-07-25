<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Open dialog</Button>

  <Dialog class="vp-raw" v-model:open="open">
    <template #headline>Delete file?</template>
    The file will be permanently removed from your workspace.

    <template #actions>
      <Button variant="text" @click="open = false">Cancel</Button>
      <Button variant="text" @click="open = false">Delete</Button>
    </template>
  </Dialog>
</template>
