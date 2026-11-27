<script setup lang="ts">
import { ref } from 'vue';
import { NumberField } from '@/components/NumberField';
import { Slider } from '@/components/Slider';

const value = ref(42.125);
</script>
<template>
  <div class="precise-slider">
    <label for="workspace-number">Opacity</label>
    <div class="workspace-number-row">
      <Slider v-model:value="value" :min="0" :max="100" :step="1" :value-indicator="false" aria-label="Opacity" />
      <NumberField
        id="workspace-number"
        :value="value"
        :min="0"
        :max="100"
        size="extra-small"
        aria-label="Exact opacity"
        @update:value="value = $event ?? value"
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
