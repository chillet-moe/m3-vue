<script setup lang="ts">
import { ref } from 'vue';
import { Radio } from '@/components/Radio';

const checked = ref(false);
</script>

<template>
  <div style="display: grid; gap: 0.75rem;">
    <Radio v-model:checked="checked" name="radio-default">Option A</Radio>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</template>
