<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckBox } from '@/components/CheckBox';
const flags = ref([true, false, false]);
const all = computed({
  get: () => flags.value.every(Boolean),
  set: (value) => {
    flags.value = flags.value.map(() => value);
  },
});
const mixed = computed(() => flags.value.some(Boolean) && !all.value);
</script>
<template>
  <div class="workspace-group">
    <CheckBox v-model:checked="all" :indeterminate="mixed">Export channels</CheckBox>
    <CheckBox v-for="(label, index) in ['Color', 'Depth', 'Mask']" :key="label" v-model:checked="flags[index]!">{{
      label
    }}</CheckBox>
  </div>
</template>
<style scoped>
.workspace-group {
  display: grid;
  --md-checkbox-target-size: 32px;
}
</style>
