<script setup lang="ts">
import { ref } from 'vue';
import { SideSheet } from '@/components/SideSheet';
import { Button } from '@/components/Button';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Open detached sheet</Button>

  <SideSheet class="vp-raw" v-model:open="open" variant="detached" width="22rem">
    <template #headline>Places</template>
    Detached side sheets keep space around the surface while staying aligned to the viewport side.
    <template #actions>
      <Button variant="text" @click="open = false">Decline</Button>
      <Button @click="open = false">Reserve</Button>
    </template>
  </SideSheet>
</template>
