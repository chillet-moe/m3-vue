<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import { IconButton } from '@/components/IconButton';
import { TextField, type TextFieldSingleLineProps } from '@/components/TextField';
import { useM3Locale } from '@/locales/context';
import { addDecimalStep } from './addDecimalStep';

export type NumberFieldProps = Pick<
  TextFieldSingleLineProps,
  | 'id'
  | 'label'
  | 'labelBehavior'
  | 'labelClearance'
  | 'alwaysFloatLabel'
  | 'name'
  | 'size'
  | 'shape'
  | 'placeholder'
  | 'supportingText'
  | 'error'
  | 'required'
  | 'disabled'
  | 'readonly'
> & {
  /** Current number, or null for an empty field. */
  value: number | null;
  /** Inclusive lower limit. */
  min?: number;
  /** Inclusive upper limit. */
  max?: number;
  /** Positive increment for the arrows and keyboard. */
  step?: number;
};

defineOptions({ inheritAttrs: false });
const { value, min, max, step = 1, disabled, readonly, ...fieldProps } = defineProps<NumberFieldProps>();
const emit = defineEmits<{ 'update:value': [value: number | null] }>();
const { messages } = useM3Locale();
const field = useTemplateRef('field');

function clamp(number: number) {
  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, number));
}

// A draft can represent the same number in several ways, or be incomplete while typing.
const draft = ref<string>();
function parseDraft(text: string) {
  if (text === '') return null;
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return undefined;

  const number = Number(text);
  return Number.isFinite(number) ? clamp(number) : undefined;
}

function edit(text: string) {
  draft.value = text;
  const parsed = parseDraft(text);
  if (parsed !== undefined && parsed !== value) emit('update:value', parsed);
}

watch(
  () => value,
  (next) => {
    if (draft.value !== undefined && parseDraft(draft.value) !== next) draft.value = undefined;
  },
);

function nextValue(direction: 1 | -1) {
  if (disabled || readonly || !Number.isFinite(step) || step <= 0) return value;
  const current = value !== null && Number.isFinite(value) ? value : 0;
  const next = clamp(addDecimalStep(current, direction * step));
  return Number.isFinite(next) ? next : value;
}

const increment = computed(() => nextValue(1));
const decrement = computed(() => nextValue(-1));

function applyStep(next: number | null) {
  draft.value = undefined;
  if (next !== value) emit('update:value', next);
  field.value?.focus();
}

function onKeydown(event: KeyboardEvent) {
  if (disabled || readonly || event.isComposing) return;
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  event.preventDefault();
  applyStep(event.key === 'ArrowUp' ? increment.value : decrement.value);
}
</script>

<template>
  <TextField
    ref="field"
    class="m3-number-field"
    v-bind="{ ...fieldProps, ...$attrs }"
    as="input"
    type="text"
    role="spinbutton"
    inputmode="decimal"
    :model-value="draft ?? String(value ?? '')"
    :aria-valuenow="value ?? undefined"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :disabled="disabled"
    :readonly="readonly"
    @update:model-value="edit"
    @keydown="onKeydown"
    @blur="draft = undefined"
  >
    <template #trailing>
      <span class="m3-number-field-controls" data-scope="number-field" data-part="controls">
        <IconButton
          variant="standard"
          icon="keyboard_arrow_up"
          data-scope="number-field"
          data-part="increment"
          :aria-label="messages.numberField.increment"
          :disabled="increment === value"
          tabindex="-1"
          @mousedown.prevent
          @click="applyStep(increment)"
        />
        <IconButton
          variant="standard"
          icon="keyboard_arrow_down"
          data-scope="number-field"
          data-part="decrement"
          :aria-label="messages.numberField.decrement"
          :disabled="decrement === value"
          tabindex="-1"
          @mousedown.prevent
          @click="applyStep(decrement)"
        />
      </span>
    </template>
  </TextField>
</template>

<style src="./NumberField.css"></style>
