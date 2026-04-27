<script setup lang="ts">
import { ref } from 'vue';
import { SideSheet } from '@/components/SideSheet';
import { Button } from '@/components/Button';

const open = ref(false);
</script>

<template>
  <Button @click="open = true">Open side sheet</Button>

  <SideSheet class="vp-raw" v-model:open="open">
    <template #headline>Details</template>
    Side sheets display supplemental content without leaving the current page.
    <template #actions>
      <Button color="text" @click="open = false">Close</Button>
    </template>
  </SideSheet>
</template>
