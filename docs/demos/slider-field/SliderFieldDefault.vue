<script setup lang="ts">
import { ref } from 'vue';
import { SliderField } from '@/components/SliderField';

const gain = ref(1.25);
</script>

<template>
  <label class="slider-field-demo">
    Gain (dB)
    <SliderField v-model:value="gain" :min="-6" :max="6" :step="0.5" />
  </label>
</template>

<style scoped>
.slider-field-demo {
  display: grid;
  grid-template-columns: auto minmax(0, 10rem);
  gap: 0.75rem;
  align-items: center;
}
</style>
