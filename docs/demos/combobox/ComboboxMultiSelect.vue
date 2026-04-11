<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Combobox } from '@/components/Combobox';
import { stateOptions } from '../shared/selectOptions';

const modelValue = ref<SelectModelValue>(['california', 'colorado']);
</script>

<template>
  <div style="max-inline-size: 22rem">
    <Combobox
      v-model="modelValue"
      label="States"
      :options="stateOptions"
      multiple
      placeholder="Choose one or more states"
      filter-placeholder="Filter states"
    />
  </div>
</template>
