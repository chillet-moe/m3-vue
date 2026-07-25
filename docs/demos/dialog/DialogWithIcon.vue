<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { Icon } from '@/components/Icon';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Open dialog</Button>

  <Dialog class="vp-raw" v-model:open="open">
    <template #icon>
      <Icon name="info" />
    </template>
    <template #headline>Sync paused</template>
    Changes are saved locally and will upload automatically when the network is available again.

    <template #actions>
      <Button variant="text" @click="open = false">Dismiss</Button>
      <Button variant="text" @click="open = false">Retry now</Button>
    </template>
  </Dialog>
</template>
