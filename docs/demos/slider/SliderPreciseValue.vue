<script setup lang="ts">
import { computed, ref } from 'vue';
import { Slider } from '@/components/Slider';
import { TextField } from '@/components/TextField';
const value = ref(42.125);
const numberText = computed({
  get: () => String(value.value),
  set: (text) => {
    if (text !== '' && Number.isFinite(Number(text))) value.value = Number(text);
  },
});
</script>
<template>
  <div class="precise-slider">
    <label for="workspace-number">Opacity</label>
    <div class="workspace-number-row">
      <Slider v-model:value="value" :min="0" :max="100" :step="1" :value-indicator="false" aria-label="Opacity" />
      <TextField
        id="workspace-number"
        v-model="numberText"
        type="number"
        size="extra-small"
        aria-label="Exact opacity"
      />
    </div>
    <Slider
      v-model:value="value"
      :min="0"
      :max="100"
      :step="1"
      aria-label="Preview opacity"
      :stop-indicators="[0, 25, 50, 75, 100]"
    />
  </div>
</template>
<style scoped>
.precise-slider {
  inline-size: 300px;
  max-inline-size: 100%;
  display: grid;
  gap: 8px;
}
.workspace-number-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px;
  gap: 8px;
  align-items: center;
}
</style>
