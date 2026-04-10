<script setup lang="ts">
import ApiTable from './ApiTable.vue';

const props = withDefaults(
  defineProps<{
    component: string;
    modelValue: Record<string, unknown>;
    exclude?: string[];
  }>(),
  {
    exclude: () => [],
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();
</script>

<template>
  <ApiTable
    :component="component"
    :model-value="modelValue"
    :exclude="exclude"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
