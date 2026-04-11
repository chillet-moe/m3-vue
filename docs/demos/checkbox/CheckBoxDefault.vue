<script setup lang="ts">
import { ref } from 'vue';
import { CheckBox } from '@/components/CheckBox';

const checked = ref(false);
</script>

<template>
  <div style="display: grid; gap: 0.75rem">
    <CheckBox v-model:checked="checked">Receive notifications</CheckBox>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</template>
