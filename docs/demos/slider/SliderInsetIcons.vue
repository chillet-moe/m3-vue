<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from '@/components/Slider';
import { numericFormatter } from '../shared/slider';

const value = ref(48);
</script>

<template>
  <Slider
    v-model:value="value"
    :min="0"
    :max="100"
    :step="1"
    start-icon="brightness_6"
    end-icon="brightness_7"
    :formatter="numericFormatter"
  />
</template>
