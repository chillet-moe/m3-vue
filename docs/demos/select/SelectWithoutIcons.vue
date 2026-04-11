<script setup lang="ts">
import { ref } from 'vue';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { coffeeOptionsWithoutIcons } from '../shared/selectOptions';

const modelValue = ref<SelectModelValue>('pour-over');
</script>

<template>
  <div style="max-inline-size: 22rem">
    <Select v-model="modelValue" label="Coffee" :options="coffeeOptionsWithoutIcons" placeholder="Choose an option" />
  </div>
</template>
