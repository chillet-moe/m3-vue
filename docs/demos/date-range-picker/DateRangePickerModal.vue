<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/Button';
import type { DateRangePickerModelValue } from '@/components/DateRangePicker';
import { DateRangePicker } from '@/components/DateRangePicker';

const modelValue = ref<DateRangePickerModelValue>(undefined);
const open = ref(false);
const buttonLabel = computed(() => {
  const start = modelValue.value?.start;
  const end = modelValue.value?.end;

  return start && end ? `${start} - ${end}` : 'Choose travel dates';
});
</script>

<template>
  <div>
    <Button variant="outlined" @click="open = true">{{ buttonLabel }}</Button>
    <DateRangePicker v-model="modelValue" v-model:open="open" variant="modal" aria-label="Choose travel dates" />
  </div>
</template>
