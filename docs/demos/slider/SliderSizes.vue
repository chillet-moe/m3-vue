<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from '@/components/Slider';
import { createStops, numericFormatter } from '../shared/slider';

const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
const value = ref(2);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <template v-for="appearance in ['standard', 'expressive'] as const" :key="appearance">
      <div>{{ appearance }}</div>
      <div v-for="size in sizes" :key="size" style="display: grid; gap: 0.25rem">
        <div style="font-size: 0.75rem; opacity: 0.72">{{ size }}</div>
        <Slider
          v-model:value="value"
          :min="0"
          :max="5"
          :step="1"
          :size="size"
          :appearance="appearance"
          :formatter="numericFormatter"
          :stop-indicators="createStops(0, 5, 1)"
        />
      </div>
    </template>
  </div>
</template>
