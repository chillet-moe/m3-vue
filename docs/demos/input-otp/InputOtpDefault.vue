<script setup lang="ts">
import { ref } from 'vue';
import { InputOtp } from '@/components/InputOtp';

const code = ref('');
</script>

<template>
  <div style="display: grid; gap: 0.75rem">
    <div style="display: grid; gap: 0.25rem">
      <label id="otp-default-label" style="color: var(--md-sys-color-on-surface-variant)">Verification code</label>
      <InputOtp v-model="code" aria-labelledby="otp-default-label" aria-describedby="otp-default-supporting" />
      <div id="otp-default-supporting" style="color: var(--md-sys-color-on-surface-variant)">
        Enter the 6-digit code sent to your device.
      </div>
    </div>
    <div>Value: {{ code || 'Empty' }}</div>
  </div>
</template>
