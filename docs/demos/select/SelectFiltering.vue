<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { stateOptions } from '../shared/selectOptions';

const modelValue = ref<SelectModelValue>(undefined);
</script>

<template>
  <div style="max-inline-size: 22rem">
    <Select
      v-model="modelValue"
      label="State"
      :options="stateOptions"
      placeholder="Choose a state"
      filterable
      filter-placeholder="Filter states"
    />
  </div>
</template>
