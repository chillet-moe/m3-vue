<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { Combobox } from '@/components/Combobox';
import { CheckBox } from '@/components/CheckBox';
import type { SelectModelValue } from '@/components/Select';
import VirtualOptions from '../select/VirtualOptions.vue';
import { virtualOptions as options } from '../select/virtualOptions';
const query = ref('');
const results = ref(options);
const loading = ref(false);
const failure = ref(false);
const simulateFailure = ref(false);
const asyncValue = ref<SelectModelValue>(9998);
let request = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  [query, simulateFailure],
  ([text]) => {
    const current = ++request;
    clearTimeout(timer);
    loading.value = true;
    failure.value = false;
    results.value = [];
    timer = setTimeout(() => {
      if (current !== request) return;
      loading.value = false;
      failure.value = simulateFailure.value;
      results.value = failure.value
        ? []
        : options.filter((option) => option.label.toLowerCase().includes(text.toLowerCase())).slice(0, 100);
    }, 350);
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  request++;
  clearTimeout(timer);
});
</script>
<template>
  <div class="async-combobox-demo">
    <Combobox
      v-model="asyncValue"
      v-model:query="query"
      label="Search layers"
      size="extra-small"
      :options="results"
      filter-mode="external"
      :resolve-label="(id) => options[Number(id)]?.label"
      :error="failure ? 'Search unavailable' : undefined"
      clearable
    >
      <template #list="list">
        <div v-if="loading || failure || !results.length" class="workspace-status" role="status">
          {{ loading ? 'Searching…' : failure ? 'Try again after disabling the error simulation.' : 'No layers found' }}
        </div>
        <VirtualOptions v-else :list="list" />
      </template>
    </Combobox>
    <CheckBox v-model:checked="simulateFailure">Simulate search error</CheckBox>
  </div>
</template>
<style scoped>
.async-combobox-demo {
  inline-size: 300px;
  max-inline-size: 100%;
  display: grid;
  gap: 12px;
}
.workspace-status {
  padding: 12px;
}
</style>
