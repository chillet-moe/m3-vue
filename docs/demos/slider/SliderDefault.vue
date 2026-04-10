<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from '@/components/Slider';
import { createStops, numericFormatter } from '../shared/slider';

const value = ref(2);
</script>

<template>
  <div style="display: grid; gap: 1rem;">
    <Slider
      v-model:value="value"
      :min="0"
      :max="5"
      :step="1"
      :formatter="numericFormatter"
      :stop-indicators="createStops(0, 5, 1)"
    />
    <div>Value: {{ value }}</div>
  </div>
</template>
