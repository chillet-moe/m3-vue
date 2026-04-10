<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { coffeeOptions } from '../shared/selectOptions';

const single = ref<SelectModelValue>('pour-over');
const multiple = ref<SelectModelValue>(['espresso', 'cold-brew']);
const empty = ref<SelectModelValue>(undefined);
</script>

<template>
  <div style="display: grid; gap: 1rem; max-inline-size: 24rem;">
    <Select v-model="single" label="Coffee" :options="coffeeOptions" description="Single selection" />
    <Select
      v-model="multiple"
      label="Beans to restock"
      :options="coffeeOptions"
      multiple
      placeholder="Choose one or more"
      description="Multiple selection stays open after each pick."
    />
    <Select
      v-model="empty"
      label="Coffee"
      :options="coffeeOptions"
      placeholder="Choose an option"
      error="Selection required"
    />
  </div>
</template>
