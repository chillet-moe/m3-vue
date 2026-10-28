<script setup lang="ts">
import { ref } from 'vue';
import { Select, provideSelectDefaults, type SelectModelValue } from '@/components/Select';
import { Combobox } from '@/components/Combobox';
import SelectVirtual from '../../../docs/demos/select/SelectVirtual.vue';
import { coffeeOptions } from '../../../docs/demos/shared/selectOptions';
const selected = ref<SelectModelValue>(['espresso']);
const closed = ref(0);
const showSelectedIcon = ref(true);
provideSelectDefaults({ showSelectedIcon });
</script>
<template>
  <main>
    <Select v-model="selected" label="Coffee" :options="coffeeOptions" multiple @closed="closed++" />
    <Combobox label="Find coffee" :options="coffeeOptions" />
    <SelectVirtual />
    <label><input id="show-checks" v-model="showSelectedIcon" type="checkbox" />Show selection marks</label>
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
