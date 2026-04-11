<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from '@/components/Slider';
import { createStops, numericFormatter } from '../shared/slider';

const placements = ['top', 'bottom', 'start', 'end'] as const;
const value = ref(2);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <div v-for="placement in placements" :key="placement" style="display: grid; gap: 0.25rem">
      <div style="font-size: 0.75rem; opacity: 0.72">{{ placement }}</div>
      <Slider
        v-model:value="value"
        :min="0"
        :max="5"
        :step="1"
        :value-indicator-placement="placement"
        :formatter="numericFormatter"
        :stop-indicators="createStops(0, 5, 1)"
      />
    </div>
  </div>
</template>
