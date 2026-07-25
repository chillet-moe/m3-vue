<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { TimePickerModelValue } from '@/components/TimePicker';
import { TimePicker } from '@/components/TimePicker';

const modelValue = ref<TimePickerModelValue>('18:05');
const open = ref(false);
</script>

<template>
  <div>
    <Button variant="outlined" @click="open = true">{{ modelValue ?? 'Choose time' }}</Button>
    <TimePicker
      v-model="modelValue"
      v-model:open="open"
      variant="modal"
      format="24h"
      title-text="Select departure time"
    />
  </div>
</template>
