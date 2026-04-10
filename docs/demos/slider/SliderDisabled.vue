<script setup lang="ts">
import { Slider } from '@/components/Slider';
import { createStops, numericFormatter } from '../shared/slider';
</script>

<template>
  <Slider
    :value="2"
    disabled
    :min="0"
    :max="5"
    :step="1"
    :formatter="numericFormatter"
    :stop-indicators="createStops(0, 5, 1)"
  />
</template>
