<script setup lang="ts">
import { ref } from 'vue';
import { NumberField } from '@/components/NumberField';

const value = ref<number | null>(1.25);
</script>

<template>
  <NumberField v-model:value="value" label="Gain (dB)" :min="-6" :max="6" :step="0.25" />
</template>
