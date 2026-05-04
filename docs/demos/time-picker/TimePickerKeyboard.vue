<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import type { TimePickerModelValue } from '@/components/TimePicker';
import { TimePicker } from '@/components/TimePicker';

const modelValue = ref<TimePickerModelValue>(undefined);
const open = ref(false);
</script>

<template>
  <div>
    <Button color="outlined" @click="open = true">{{ modelValue ?? 'Enter time' }}</Button>
    <TimePicker v-model="modelValue" v-model:open="open" input-mode="keyboard" />
  </div>
</template>
