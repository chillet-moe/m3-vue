<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Button } from '@/components/Button';
import { LinearProgressIndicator } from '@/components/LinearProgressIndicator';

const values = [0.08, 0.72, 0.28, 0.96, 0.44];
const valueIndex = ref(0);
const value = ref(values[valueIndex.value]);

let interval = 0;

const advanceValue = () => {
  valueIndex.value = (valueIndex.value + 1) % values.length;
  value.value = values[valueIndex.value];
};

onMounted(() => {
  interval = window.setInterval(advanceValue, 1600);
});

onBeforeUnmount(() => {
  window.clearInterval(interval);
});
</script>

<template>
  <div class="demo-linear-progress-indicator-value-animation">
    <LinearProgressIndicator :value="value" aria-label="Transfer progress" />
    <LinearProgressIndicator :value="value" shape="wavy" aria-label="Wavy transfer progress" />
    <div class="demo-linear-progress-indicator-value-animation-controls">
      <Button variant="tonal" @click="advanceValue">Next value</Button>
      <span>{{ Math.round(value * 100) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.demo-linear-progress-indicator-value-animation {
  display: grid;
  gap: 1rem;
  inline-size: min(24rem, 100%);
}

.demo-linear-progress-indicator-value-animation-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}
</style>
