<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/Button';
import type { DateRangePickerModelValue } from '@/components/DateRangePicker';
import { DateRangePicker } from '@/components/DateRangePicker';

const modelValue = ref<DateRangePickerModelValue>({
  start: '2026-05-12',
  end: '2026-05-18',
});
const open = ref(false);
const anchorEl = ref<HTMLElement>();
const anchorName = '--date-range-picker-constraints-anchor';
const buttonLabel = computed(() => {
  const start = modelValue.value?.start;
  const end = modelValue.value?.end;

  return start && end ? `${start} - ${end}` : 'Choose reservation dates';
});
</script>

<template>
  <div>
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex">
      <Button variant="outlined" @click="open = true">{{ buttonLabel }}</Button>
    </span>
    <DateRangePicker
      v-model="modelValue"
      v-model:open="open"
      :anchor-name="anchorName"
      :anchor-element="anchorEl"
      min="2026-05-01"
      max="2026-05-31"
      aria-label="Choose reservation dates"
    />
  </div>
</template>
