<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { TimePickerModelValue } from '@/components/TimePicker';
import { TimePicker } from '@/components/TimePicker';

const modelValue = ref<TimePickerModelValue>('09:30');
const open = ref(false);
const anchorEl = ref<HTMLElement>();
const anchorName = '--time-picker-default-anchor';
</script>

<template>
  <div>
    <span ref="anchorEl" :style="{ 'anchor-name': anchorName }" style="display: inline-flex">
      <Button variant="outlined" @click="open = true">{{ modelValue ?? 'Choose time' }}</Button>
    </span>
    <TimePicker v-model="modelValue" v-model:open="open" :anchor-name="anchorName" :anchor-element="anchorEl" />
  </div>
</template>
