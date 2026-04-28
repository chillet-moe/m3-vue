<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { DatePickerModelValue } from '@/components/DatePicker';
import { DatePicker } from '@/components/DatePicker';

const modelValue = ref<DatePickerModelValue>(undefined);
const open = ref(false);
</script>

<template>
  <div>
    <Button color="outlined" @click="open = true">{{ modelValue ?? 'Choose travel date' }}</Button>
    <DatePicker v-model="modelValue" v-model:open="open" variant="modal" aria-label="Choose travel date" />
  </div>
</template>
