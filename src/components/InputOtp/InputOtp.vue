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

const hasValue = computed(() => {
  return modelValue.value.length > 0;
});

const isComplete = computed(() => {
  return modelValue.value.length >= normalizedLength.value;
});

const resolvedInputMode = computed(() => {
  return props.inputMode ?? (props.type === 'number' ? 'numeric' : 'text');
});

const digitValues = computed(() => {
  const length = normalizedLength.value;
  const cells = readCharacters(modelValue.value, length);
  const populated = cells.length;
  cells.length = length;
  cells.fill('', populated);
  return cells;
});

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

  if (modelValue.value.length > normalizedLength.value) {
    modelValue.value = digitValues.value.join('');
  }
});

function readCharacters(value: string, limit: number): string[] {
  const characters: string[] = [];

  if (props.type === 'number') {
    // Only ASCII digits can fill numeric cells.
    const firstDigit = '0'.charCodeAt(0);
    const lastDigit = '9'.charCodeAt(0);
    for (let index = 0; index < value.length; index++) {
      const code = value.charCodeAt(index);
      if (code < firstDigit || code > lastDigit) continue;
      characters.push(value[index]);
      if (characters.length >= limit) break;
    }
    return characters;
  }

  const nonWhitespace = /\S/u;
  for (const character of value) {
    if (!nonWhitespace.test(character)) continue;
    characters.push(character);
    if (characters.length >= limit) break;
  }

  return characters;
}

function commitCharacters(nextCharacters: string[]) {
  const nextValue = nextCharacters.slice(0, normalizedLength.value).join('');
  const previousValue = modelValue.value;

  modelValue.value = nextValue;

  if (nextValue.length === normalizedLength.value && nextValue !== previousValue) {
    emit('complete', nextValue);
  }
}

function focusCell(index: number) {
  inputRefs.value[index]?.focus();
}

function selectCell(index: number) {
  inputRefs.value[index]?.select();
}

function moveFocus(index: number) {
  const nextIndex = Math.min(Math.max(index, 0), normalizedLength.value - 1);
  void nextTick(() => {
    focusCell(nextIndex);
    selectCell(nextIndex);
  });
}

function applyText(value: string, startIndex: number) {
  const nextCharacters = digitValues.value.slice();
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

  if (event.key === 'Backspace') {
    event.preventDefault();
    const characters = digitValues.value;
    const cellToClear = characters[index] ? index : index - 1;
    if (cellToClear < 0) return;

    const nextCharacters = characters.slice();
    nextCharacters[cellToClear] = '';
    commitCharacters(nextCharacters);
    moveFocus(cellToClear);
    return;
  }

  if (event.key === 'Delete') {
    event.preventDefault();
    const nextCharacters = digitValues.value.slice();
    nextCharacters[index] = '';
    commitCharacters(nextCharacters);
    moveFocus(index);
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    moveFocus(index - 1);
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    moveFocus(index + 1);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    moveFocus(0);
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    moveFocus(normalizedLength.value - 1);
  }
}

function handleChange(event: Event) {
  emit('change', event);
}

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}

function focus(index = 0) {
  focusCell(Math.min(Math.max(index, 0), normalizedLength.value - 1));
}

function blur() {
  for (const input of inputRefs.value) {
    input?.blur();
  }
}

function select(index = 0) {
  selectCell(Math.min(Math.max(index, 0), normalizedLength.value - 1));
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
    :data-populated="hasValue ? 'true' : 'false'"
    :data-complete="isComplete ? 'true' : 'false'"
    role="group"
    :aria-invalid="props.invalid ? 'true' : undefined"
  >
    <div class="m3-input-otp-group" data-scope="input-otp" data-part="group">
      <input
        v-if="props.name"
        class="m3-input-otp-native"
        data-scope="input-otp"
        data-part="native"
        type="hidden"
        :name="props.name"
        :value="modelValue"
      />

      <input
        v-for="(digit, index) in digitValues"
        :id="`${inputIdPrefix}-${index}`"
        :key="index"
        :ref="(el) => setInputRef(el, index)"
        class="m3-input-otp-input"
        data-scope="input-otp"
        data-part="input"
        :data-filled="digit ? 'true' : 'false'"
        :type="props.mask ? 'password' : 'text'"
        :value="digit"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :readonly="props.readonly"
        :required="props.required"
        :inputmode="resolvedInputMode"
        :autocomplete="index === 0 ? props.autocomplete : 'off'"
        :aria-label="getInputAriaLabel(index)"
        :aria-invalid="props.invalid ? 'true' : undefined"
        :aria-describedby="rootAriaDescribedby"
        maxlength="1"
        @input="handleInput($event, index)"
        @paste="handlePaste($event, index)"
        @keydown="handleKeydown($event, index)"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<style src="./InputOtp.css"></style>
