<script setup lang="ts">
import { ref } from 'vue';
import { TextField } from '@/components/TextField';

const modelValue = ref('');
</script>

<template>
  <div style="max-inline-size: 22rem;">
    <TextField v-model="modelValue" label="Label" description="Supporting text" />
  </div>
</template>
