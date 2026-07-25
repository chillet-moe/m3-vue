<script setup lang="ts">
import { ref } from 'vue';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Open bottom sheet</Button>

  <BottomSheet class="vp-raw" v-model:open="open">
    <template #headline>Share</template>
    Choose where this item should be shared.
    <template #actions>
      <Button variant="text" @click="open = false">Cancel</Button>
      <Button variant="text" @click="open = false">Copy link</Button>
    </template>
  </BottomSheet>
</template>
