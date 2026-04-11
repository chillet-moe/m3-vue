<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from '@/components/Slider';
import { createStops, numericFormatter } from '../shared/slider';

const directions = ['ltr', 'rtl'] as const;
const value = ref(2);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <div v-for="direction in directions" :key="direction" style="display: grid; gap: 0.25rem">
      <div style="font-size: 0.75rem; opacity: 0.72">{{ direction }}</div>
      <Slider
        v-model:value="value"
        :min="0"
        :max="5"
        :step="1"
        :direction="direction"
        :formatter="numericFormatter"
        :stop-indicators="createStops(0, 5, 1)"
      />
    </div>
  </div>
</template>
