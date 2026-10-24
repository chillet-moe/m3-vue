<script setup lang="ts">
import { ref } from 'vue';
import { Select, type SelectModelValue } from '@/components/Select';
import { Combobox } from '@/components/Combobox';
import VirtualOptions from './VirtualOptions.vue';
import { virtualOptions as options } from './virtualOptions';
const single = ref<SelectModelValue>(9998);
const multiple = ref<SelectModelValue>([1, 3]);
</script>
<template>
  <div class="virtual-select-demo">
    <Select v-model="single" label="Layer" size="extra-small" :options="options" clearable>
      <template #list="list"><VirtualOptions :list="list" /></template>
    </Select>
    <Combobox v-model="multiple" label="Linked layers" size="extra-small" :options="options" multiple clearable>
      <template #list="list"><VirtualOptions :list="list" /></template>
    </Combobox>
  </div>
</template>
<style scoped>
.virtual-select-demo {
  inline-size: 300px;
  max-inline-size: 100%;
  display: grid;
  gap: 12px;
}
</style>
