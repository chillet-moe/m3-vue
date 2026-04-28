<script setup lang="ts">
import { ref } from 'vue';
import { TextField } from '@/components/TextField';

const modelValue = ref('2026-05-12');
</script>

<template>
  <div style="max-inline-size: 22rem">
    <TextField
      v-model="modelValue"
      type="date"
      label="Reservation"
      min="2026-05-01"
      max="2026-05-31"
      description="Available during May 2026"
    />
  </div>
</template>
