<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { coffeeOptions } from '../shared/selectOptions';

const modelValue = ref<SelectModelValue>(undefined);
</script>

<template>
  <div style="max-inline-size: 22rem;">
    <Select v-model="modelValue" label="Coffee" :options="coffeeOptions" placeholder="Choose an option" />
  </div>
</template>
