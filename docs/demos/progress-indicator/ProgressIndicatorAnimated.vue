<script setup lang="ts">
import { ref } from 'vue';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { Slider } from '@/components/Slider';

const value = ref(62);
</script>

<template>
  <div style="display: grid; gap: 1.5rem; inline-size: min(100%, 22rem)">
    <Slider v-model:value="value" :min="0" :max="100" :step="1" />
    <ProgressIndicator :value="value" />
    <ProgressIndicator variant="circular" :value="value" />
  </div>
</template>
