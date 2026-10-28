<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
const options = [
  { label: 'Espresso', value: 'espresso' },
  { label: 'Pour-over', value: 'pour-over' },
  { label: 'Cold brew', value: 'cold-brew' },
];

const modelValue = ref<SelectModelValue>(undefined);
</script>

<template>
  <div style="max-inline-size: 22rem">
    <Select v-model="modelValue" label="Coffee" :options="options" placeholder="Choose an option" />
  </div>
</template>
