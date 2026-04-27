<script setup lang="ts">
import { ref } from 'vue';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Open compact sheet</Button>

  <BottomSheet class="vp-raw" v-model:open="open" :show-drag-handle="false" max-height="18rem">
    <template #headline>Compact sheet</template>
    This sheet hides the drag handle and caps the surface height.
  </BottomSheet>
</template>
