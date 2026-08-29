<script setup lang="ts">
import { ref } from 'vue';
import { CheckBox } from '@/components/CheckBox';
import { TextField } from '@/components/TextField';

const password = ref('p@ssw0rd-123');
const showPassword = ref(false);
</script>

<template>
  <div style="display: grid; gap: 0.75rem; max-inline-size: 24rem">
    <TextField
      label="Password"
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      autocomplete="current-password"
      supporting-text="Toggle the checkbox below to reveal the current value."
    />

    <CheckBox v-model:checked="showPassword">Show password</CheckBox>
  </div>
</template>
