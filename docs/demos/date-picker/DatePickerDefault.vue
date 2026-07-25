<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { DatePickerModelValue } from '@/components/DatePicker';
import { DatePicker } from '@/components/DatePicker';

const modelValue = ref<DatePickerModelValue>('2026-04-28');
const open = ref(false);
const anchorEl = ref<HTMLElement>();
const anchorName = '--date-picker-default-anchor';
</script>

<template>
  <div>
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex">
      <Button variant="outlined" @click="open = true">{{ modelValue ?? 'Choose date' }}</Button>
    </span>
    <DatePicker v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
  </div>
</template>
