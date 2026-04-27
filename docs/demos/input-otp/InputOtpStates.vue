<script setup lang="ts">
import { ref } from 'vue';
import { InputOtp } from '@/components/InputOtp';

const defaultCode = ref('');
const errorCode = ref('123');
const maskedCode = ref('829104');
const readonlyCode = ref('246810');
</script>

<template>
  <div style="display: grid; gap: 1rem">
    <InputOtp v-model="defaultCode" aria-label="Small code" size="small" placeholder="0" />
    <InputOtp v-model="maskedCode" aria-label="Masked code" mask size="medium" />
    <InputOtp v-model="readonlyCode" aria-label="Readonly code" readonly size="large" />
    <div style="display: grid; gap: 0.25rem">
      <InputOtp v-model="errorCode" aria-label="Code with error" aria-describedby="otp-error" invalid />
      <div id="otp-error" style="color: var(--md-sys-color-error)">The code is incomplete.</div>
    </div>
    <InputOtp aria-label="Disabled code" model-value="123456" disabled />
  </div>
</template>
