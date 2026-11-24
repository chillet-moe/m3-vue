<script setup lang="ts">
import { ref } from 'vue';
import { Button, CheckBox } from '@chillet/m3-vue';

const selected = ref(true);
</script>

<template>
  <div class="file-actions">
    <CheckBox v-model:checked="selected">Select file</CheckBox>
    <Button class="warning-theme" variant="filled" :disabled="!selected">Delete file</Button>
    <Button>Preview</Button>
  </div>
</template>

<style scoped>
.file-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
</style>
