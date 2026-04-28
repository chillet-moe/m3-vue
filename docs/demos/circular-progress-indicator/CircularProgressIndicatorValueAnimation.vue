<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Button } from '@/components/Button';
import { CircularProgressIndicator } from '@/components/CircularProgressIndicator';

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
  <div class="demo-circular-progress-indicator-value-animation">
    <div class="demo-circular-progress-indicator-value-animation-row">
      <CircularProgressIndicator :value="value" aria-label="Transfer progress" />
      <CircularProgressIndicator
        :value="value"
        direction="counterclockwise"
        aria-label="Counterclockwise transfer progress"
      />
      <CircularProgressIndicator :value="value" shape="wavy" aria-label="Wavy transfer progress" />
    </div>
    <div class="demo-circular-progress-indicator-value-animation-controls">
      <Button color="tonal" @click="advanceValue">Next value</Button>
      <span>{{ Math.round(value * 100) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.demo-circular-progress-indicator-value-animation {
  display: grid;
  gap: 1rem;
}

.demo-circular-progress-indicator-value-animation-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.demo-circular-progress-indicator-value-animation-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  inline-size: min(18rem, 100%);
}
</style>
