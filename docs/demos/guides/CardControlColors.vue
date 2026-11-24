<script setup lang="ts">
import { ref } from 'vue';
import { Button, Card, CheckBox } from '@chillet/m3-vue';

const reminders = ref(true);
</script>

<template>
  <Card class="reminder-card teal-theme">
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
