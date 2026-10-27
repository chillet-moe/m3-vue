<script setup lang="ts">
import { ref } from 'vue';
import { Select, type SelectModelValue } from '@/components/Select';
import { Combobox } from '@/components/Combobox';
import SelectVirtual from '../../../docs/demos/select/SelectVirtual.vue';
import { coffeeOptions } from '../../../docs/demos/shared/selectOptions';
const selected = ref<SelectModelValue>(['espresso']);
const closed = ref(0);
</script>
<template>
  <main>
    <Select v-model="selected" label="Coffee" :options="coffeeOptions" multiple @closed="closed++" />
    <Combobox label="Find coffee" :options="coffeeOptions" />
    <SelectVirtual />
    <output id="closed">{{ closed }}</output>
  </main>
</template>
<style scoped>
main {
  display: grid;
  gap: 1rem;
  width: 24rem;
  padding: 2rem;
}
</style>
