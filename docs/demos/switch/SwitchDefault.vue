<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '@/components/Switch';

const checked = ref(false);
</script>

<template>
  <div style="display: grid; gap: 0.75rem">
    <Switch v-model:checked="checked">Airplane mode</Switch>
    <div>Checked: {{ checked ? 'true' : 'false' }}</div>
  </div>
</template>
