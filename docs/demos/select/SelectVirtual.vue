<script setup lang="ts">
import { ref } from 'vue';
import { Select, type SelectModelValue } from '@/components/Select';
import { Combobox } from '@/components/Combobox';
import VirtualSelectList from './VirtualSelectList.vue';

const options = Array.from({ length: 10000 }, (_, index) => ({
  value: index,
  label: index % 13 === 0 ? `Layer ${index} — detailed mechanical assembly and supporting geometry` : `Layer ${index}`,
  disabled: index % 17 === 0,
  leadingIcon: index % 3 === 0 ? 'layers' : undefined,
  supportingText: index % 5 === 0 ? 'A detailed layer description with additional information' : undefined,
}));
const single = ref<SelectModelValue>(1);
const multiple = ref<SelectModelValue>([1, 500]);
</script>

<template>
  <div class="virtual-select-demo">
    <Select v-model="single" label="Layer" :options="options" clearable>
      <template #list="list"><VirtualSelectList :list="list" /></template>
    </Select>
    <Combobox v-model="multiple" label="Find layers" :options="options" multiple clearable>
      <template #list="list"><VirtualSelectList :list="list" /></template>
    </Combobox>
  </div>
</template>

<style scoped>
.virtual-select-demo {
  display: grid;
  gap: 1rem;
  max-inline-size: 24rem;
}
</style>
