<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Chip, ChipGroup, Switch, TextField } from '@/index';
import type { PropMeta } from '../plugins/component-meta';
import { getControlType } from './control-meta';

const props = defineProps<{
  prop: PropMeta;
  modelValue: unknown;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
}>();

const controlType = computed(() => {
  return getControlType(props.prop);
});

const booleanValue = computed({
  get() {
    return Boolean(props.modelValue);
  },
  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

const textValue = computed({
  get() {
    return typeof props.modelValue === 'string' ? props.modelValue : '';
  },
  set(value: string) {
    emit('update:modelValue', value);
  },
});

function normalizeNumberControlValue(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return undefined;
  }

  const nextValue = Number(trimmedValue);
  return Number.isNaN(nextValue) ? undefined : nextValue;
}

function formatNumberArrayControlValue(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item))
    ? value.join(', ')
    : '';
}

function normalizeNumberArrayControlValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { valid: true, value: undefined };
  }

  const parts = trimmedValue.split(',').map((part) => part.trim());

  if (parts.some((part) => !part)) {
    return { valid: false, value: undefined };
  }

  const values = parts.map((part) => Number(part));

  if (values.some((item) => !Number.isFinite(item))) {
    return { valid: false, value: undefined };
  }

  return { valid: true, value: values };
}

const numberTextValue = computed<string, string | number | undefined>({
  get() {
    if (typeof props.modelValue === 'number' && Number.isFinite(props.modelValue)) {
      return String(props.modelValue);
    }

    return '';
  },
  set(value) {
    emit('update:modelValue', normalizeNumberControlValue(value));
  },
});

const isNumberArrayFocused = ref(false);
const numberArrayTextValue = ref(formatNumberArrayControlValue(props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    if (!isNumberArrayFocused.value) {
      numberArrayTextValue.value = formatNumberArrayControlValue(value);
    }
  },
);

function updateNumberArrayValue(value: string) {
  numberArrayTextValue.value = value;

  const nextValue = normalizeNumberArrayControlValue(value);
  if (nextValue.valid) {
    emit('update:modelValue', nextValue.value);
  }
}

function handleNumberArrayInput(event: Event) {
  updateNumberArrayValue((event.target as HTMLInputElement | HTMLTextAreaElement).value);
}

function handleNumberArrayFocus() {
  isNumberArrayFocused.value = true;
}

function handleNumberArrayBlur() {
  isNumberArrayFocused.value = false;
  numberArrayTextValue.value = formatNumberArrayControlValue(props.modelValue);
}

const optionValue = computed({
  get() {
    return typeof props.modelValue === 'string' || typeof props.modelValue === 'number' ? props.modelValue : undefined;
  },
  set(value: string | number | undefined) {
    emit('update:modelValue', value);
  },
});

const inputLabel = computed(() => {
  return props.prop.description ?? props.prop.name;
});
</script>

<template>
  <Switch v-if="controlType === 'switch'" v-model:checked="booleanValue" :aria-label="inputLabel" />

  <ChipGroup
    v-else-if="controlType === 'select'"
    v-model="optionValue"
    class="control-item-chip-group"
    selection-mode="single"
    :aria-label="inputLabel"
  >
    <Chip v-for="option in prop.options" :key="option" variant="filter" :value="option">
      {{ option }}
    </Chip>
  </ChipGroup>

  <TextField
    v-else-if="controlType === 'text'"
    v-model="textValue"
    class="control-item-field"
    :aria-label="inputLabel"
    :placeholder="prop.name"
  />

  <TextField
    v-else-if="controlType === 'number'"
    v-model="numberTextValue"
    class="control-item-field"
    :aria-label="inputLabel"
    :placeholder="prop.name"
    inputmode="decimal"
    type="number"
    step="any"
  />

  <TextField
    v-else-if="controlType === 'number-array'"
    v-model="numberArrayTextValue"
    class="control-item-field"
    :aria-label="inputLabel"
    :placeholder="prop.name"
    inputmode="decimal"
    @input="handleNumberArrayInput"
    @focus="handleNumberArrayFocus"
    @blur="handleNumberArrayBlur"
  />

  <span v-else class="control-item-unsupported">Unsupported</span>
</template>

<style scoped>
.control-item-chip-group {
  inline-size: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.control-item-field {
  inline-size: min(100%, 17.5rem);
}

.control-item-unsupported {
  color: var(--vp-c-text-3);
  font-size: 0.875rem;
}
</style>
