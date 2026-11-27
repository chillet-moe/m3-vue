<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import type { TextFieldSize } from '@/components/TextField/TextField.vue';
import { useFieldSize } from '@/components/TextField/FieldContext';
import { parseDecimal } from '@/internal/parseDecimal';
import { moveSliderSteps, snapSliderValue } from '@/internal/sliderSteps';

export type SliderFieldProps = {
  /** Inclusive lower bound and origin of the step grid. */
  min?: number;
  /** Inclusive upper bound, even when it is between steps. */
  max?: number;
  /** Increment for dragging and arrow keys. */
  step?: number;
  /** Field size. Inherits the field default and falls back to extra-small. */
  size?: TextFieldSize;
  disabled?: boolean;
};

const { min = 0, max = 100, step = 1, size, disabled } = defineProps<SliderFieldProps>();
const effectiveSize = useFieldSize(() => size, 'extra-small');
const value = defineModel<number>('value', { required: true });
const input = useTemplateRef('input');
const draft = ref<string>();
const editing = computed(() => draft.value !== undefined);
const fill = computed(() => (max > min ? Math.max(0, Math.min(1, (value.value - min) / (max - min))) : 0));

const dragThreshold = 4;
let gesture:
  | {
      id: number;
      startX: number;
      startY: number;
      startValue: number;
      width: number;
      dragged: boolean;
    }
  | undefined;

function beginEdit() {
  if (disabled || editing.value || gesture) return;
  draft.value = String(value.value);
  input.value?.focus();
  input.value?.select();
}

function onInput(event: Event) {
  if (editing.value) draft.value = (event.target as HTMLInputElement).value;
}

function commit() {
  if (draft.value === undefined) return;
  const number = parseDecimal(draft.value.trim());
  if (!disabled && number !== undefined) value.value = Math.min(max, Math.max(min, number));
  draft.value = undefined;
}

function onKeydown(event: KeyboardEvent) {
  if (disabled || event.isComposing || gesture) return;
  if (editing.value) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      draft.value = undefined;
    } else if (event.key === 'Enter') {
      commit();
    } else {
      return;
    }
    event.preventDefault();
    return;
  }

  switch (event.key) {
    case 'Enter':
      beginEdit();
      break;
    case 'ArrowUp':
    case 'ArrowRight':
      value.value = moveSliderSteps(value.value, 1, min, max, step);
      break;
    case 'ArrowDown':
    case 'ArrowLeft':
      value.value = moveSliderSteps(value.value, -1, min, max, step);
      break;
    case 'Home':
      value.value = min;
      break;
    case 'End':
      value.value = max;
      break;
    default:
      return;
  }
  event.preventDefault();
}

function onPointerDown(event: PointerEvent) {
  if (disabled || editing.value || gesture || event.button !== 0 || !event.isPrimary) return;
  event.preventDefault();
  const field = event.currentTarget as HTMLInputElement;
  field.focus();
  field.setPointerCapture(event.pointerId);
  gesture = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startValue: value.value,
    width: field.getBoundingClientRect().width,
    dragged: false,
  };
}

function onPointerMove(event: PointerEvent) {
  if (!gesture || event.pointerId !== gesture.id) return;
  const deltaX = event.clientX - gesture.startX;
  if (!gesture.dragged) {
    const deltaY = event.clientY - gesture.startY;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < dragThreshold) return;
    gesture.dragged = true;
  }
  if (gesture.width <= 0) return;
  const target = gesture.startValue + (deltaX / gesture.width) * (max - min);
  if (target !== value.value) value.value = snapSliderValue(target, min, max, step);
}

function onPointerUp(event: PointerEvent) {
  if (!gesture || event.pointerId !== gesture.id) return;
  onPointerMove(event);
  const { dragged } = gesture;
  gesture = undefined;
  if (!dragged) beginEdit();
}

function cancelPointer(event: PointerEvent) {
  if (gesture?.id === event.pointerId) gesture = undefined;
}

watch(
  () => disabled,
  (isDisabled) => {
    if (isDisabled) {
      gesture = undefined;
      draft.value = undefined;
    }
  },
);
</script>

<template>
  <input
    ref="input"
    class="m3-slider-field m3-field-size"
    data-scope="slider-field"
    data-part="root"
    :data-size="effectiveSize"
    type="text"
    inputmode="decimal"
    :role="editing ? undefined : 'spinbutton'"
    :aria-valuenow="editing ? undefined : value"
    :aria-valuemin="editing ? undefined : min"
    :aria-valuemax="editing ? undefined : max"
    :readonly="!editing"
    :disabled="disabled"
    :value="draft ?? String(value)"
    :style="{ '--_fill': fill * 100 + '%' }"
    @input="onInput"
    @blur="commit"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="cancelPointer"
    @lostpointercapture="cancelPointer"
    @click="$event.detail === 0 && beginEdit()"
  />
</template>

<style src="./SliderField.css"></style>
