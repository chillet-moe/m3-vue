<script setup lang="ts">
import { ref } from 'vue';
import { Button, Card, CheckBox } from '@chillet/m3-vue';
import { createColorTheme } from '@chillet/m3-vue/theme';

const teal = createColorTheme('#008578');

const reminders = ref(true);
</script>

<template>
  <Card class="reminder-card" v-bind="teal">
    <CheckBox v-model:checked="reminders">Email reminders</CheckBox>
    <Button variant="outlined" @click="reminders = true">Restore default</Button>
  </Card>
</template>

<style scoped>
.reminder-card {
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}
</style>
