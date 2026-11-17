<script setup lang="ts">
import { useShape, type M3Shape } from '@/styles/shape';
import { isHTMLTag } from '@/internal/elementEnvironment';

import { computed, nextTick, ref, useAttrs, useId, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';

export type InputOtpProps = {
  /** Corner style; inherits the shared shape default. */
  shape?: M3Shape;
  /** Optional explicit id prefix for the native controls. */
  id?: string;

  /** Number of characters in the code. */
  length?: number;

  /** Visual size of each input cell. */
  size?: 'small' | 'medium' | 'large';

  /** Restrict input to digits. */
  type?: 'text' | 'number';

  /** Whether to hide entered characters. */
  mask?: boolean;

  /** Whether the controls are visually invalid. */
  invalid?: boolean;

  /** Whether the controls are disabled. */
  disabled?: boolean;

  /** Whether the controls are required. */
  required?: boolean;

  /** Whether the controls are readonly. */
  readonly?: boolean;

  /** Name attribute for form submissions. */
  name?: string;

  /** Placeholder shown in each empty cell. */
  placeholder?: string;

  /** Autocomplete hint for the first control. */
  autocomplete?: string;

  /** Input mode hint for virtual keyboards. */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
};

const generatedId = useId();
const attrs = useAttrs();

const props = withDefaults(defineProps<InputOtpProps>(), {
  id: undefined,
  length: 6,
  size: 'medium',
  type: 'number',
  mask: false,
  invalid: false,
  disabled: false,
  required: false,
  readonly: false,
  name: undefined,
  placeholder: undefined,
  autocomplete: 'one-time-code',
  inputMode: undefined,
});

const emit = defineEmits<{
  input: [event: Event];
  change: [event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  complete: [value: string];
}>();

const modelValue = defineModel<string>({ default: '' });

const rootRef = ref<HTMLDivElement>();
const inputRefs = ref<HTMLInputElement[]>([]);

const normalizedLength = computed(() => {
  if (!Number.isFinite(props.length)) {
    return 6;
  }

  return Math.max(1, Math.trunc(props.length));
});

const inputIdPrefix = computed(() => {
  return props.id ?? `m3-input-otp-${generatedId}`;
});

const resolvedInputMode = computed(() => {
  return props.inputMode ?? (props.type === 'number' ? 'numeric' : 'text');
});

const characters = computed(() => readCharacters(modelValue.value, normalizedLength.value));

const groupLabel = computed(() => {
  const ariaLabel = attrs['aria-label'];
  if (typeof ariaLabel === 'string' && ariaLabel.length > 0) {
    return ariaLabel;
  }

  return 'One-time code';
});

const rootAriaDescribedby = computed(() => {
  const ariaDescribedby = attrs['aria-describedby'];

  return typeof ariaDescribedby === 'string' ? ariaDescribedby : undefined;
});

watch(normalizedLength, () => {
  inputRefs.value.length = normalizedLength.value;

  modelValue.value = characters.value.join('');
});

function readCharacters(value: string, limit: number): string[] {
  const characters: string[] = [];

  const allowed = props.type === 'number' ? /^[0-9]$/ : /\S/u;
  for (const character of value) {
    if (!allowed.test(character)) continue;
    characters.push(character);
    if (characters.length >= limit) break;
  }

  return characters;
}

function commitCharacters(nextCharacters: string[]) {
  const populated = nextCharacters.filter(Boolean);
  const nextValue = populated.join('');
  const previousValue = modelValue.value;

  modelValue.value = nextValue;

  if (populated.length === normalizedLength.value && nextValue !== previousValue) {
    emit('complete', nextValue);
  }
}

function cellAt(index: number) {
  return inputRefs.value[Math.min(Math.max(index, 0), normalizedLength.value - 1)];
}

function moveFocus(index: number) {
  void nextTick(() => {
    const cell = cellAt(index);
    cell?.focus();
    cell?.select();
  });
}

function applyText(value: string, startIndex: number) {
  const nextCharacters = characters.value.slice();
  const chars = readCharacters(value, normalizedLength.value - startIndex);

  if (chars.length === 0) {
    nextCharacters[startIndex] = '';
    commitCharacters(nextCharacters);
    return;
  }

  for (const [offset, char] of chars.entries()) {
    nextCharacters[startIndex + offset] = char;
  }

  commitCharacters(nextCharacters);
  moveFocus(startIndex + chars.length);
}

function setInputRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (isHTMLTag(el, 'input')) {
    inputRefs.value[index] = el;
  }
}

function getInputAriaLabel(index: number) {
  return `${groupLabel.value} character ${index + 1} of ${normalizedLength.value}`;
}

function handleInput(event: Event, index: number) {
  emit('input', event);

  if (props.disabled || props.readonly) {
    return;
  }

  const target = event.currentTarget;

  if (!isHTMLTag(target, 'input')) {
    return;
  }

  applyText(target.value, index);
}

function handlePaste(event: ClipboardEvent, index: number) {
  if (props.disabled || props.readonly) {
    return;
  }

  const text = event.clipboardData?.getData('text') ?? '';

  if (!text) {
    return;
  }

  event.preventDefault();
  applyText(text, index);
}

function handleKeydown(event: KeyboardEvent, index: number) {
  emit('keydown', event);

  if (props.disabled || props.readonly) {
    return;
  }

  const key = event.key;
  if (key === 'Backspace' || key === 'Delete') {
    event.preventDefault();
    const cell = key === 'Backspace' && !characters.value[index] ? index - 1 : index;
    if (cell < 0) return;

    const nextCharacters = characters.value.slice();
    nextCharacters[cell] = '';
    commitCharacters(nextCharacters);
    moveFocus(cell);
    return;
  }

  let destination: number;
  switch (key) {
    case 'ArrowLeft':
      destination = index - 1;
      break;
    case 'ArrowRight':
      destination = index + 1;
      break;
    case 'Home':
      destination = 0;
      break;
    case 'End':
      destination = normalizedLength.value - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  moveFocus(destination);
}

function focus(index = 0) {
  cellAt(index)?.focus();
}

function blur() {
  for (const input of inputRefs.value) {
    input?.blur();
  }
}

function select(index = 0) {
  cellAt(index)?.select();
}

defineExpose({
  rootEl: rootRef,
  els: inputRefs,
  focus,
  blur,
  select,
});
const shape = useShape(() => props.shape);
</script>

<template>
  <div
    ref="rootRef"
    class="m3-input-otp"
    data-scope="input-otp"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :data-size="props.size"
    :data-invalid="props.invalid ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-readonly="props.readonly ? 'true' : 'false'"
    :data-populated="characters.length > 0 ? 'true' : 'false'"
    :data-complete="characters.length === normalizedLength ? 'true' : 'false'"
    role="group"
    :aria-invalid="props.invalid ? 'true' : undefined"
  >
    <input
      v-if="props.name"
      data-scope="input-otp"
      data-part="native"
      type="hidden"
      :name="props.name"
      :value="modelValue"
      :disabled="props.disabled"
    />

    <input
      v-for="(_, index) in normalizedLength"
      :id="`${inputIdPrefix}-${index}`"
      :key="index"
      :ref="(el) => setInputRef(el, index)"
      class="m3-input-otp-input"
      data-scope="input-otp"
      data-part="input"
      :data-filled="characters[index] ? 'true' : 'false'"
      :type="props.mask ? 'password' : 'text'"
      :value="characters[index] ?? ''"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :required="props.required"
      :inputmode="resolvedInputMode"
      :autocomplete="index === 0 ? props.autocomplete : 'off'"
      :aria-label="getInputAriaLabel(index)"
      :aria-invalid="props.invalid ? 'true' : undefined"
      :aria-describedby="rootAriaDescribedby"
      @input="handleInput($event, index)"
      @paste="handlePaste($event, index)"
      @keydown="handleKeydown($event, index)"
      @change="emit('change', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
  </div>
</template>

<style src="./InputOtp.css"></style>
