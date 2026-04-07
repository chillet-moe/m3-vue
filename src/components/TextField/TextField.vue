<script setup lang="ts">
import { computed, ref, useAttrs, useId, useSlots } from 'vue';

export type TextFieldProps = {
  /** Visible label. If omitted, provide aria-label via attrs. */
  label?: string;

  /** Optional explicit id for native control element. */
  id?: string;

  /** Render either a single-line input or multiline textarea. */
  as?: 'input' | 'textarea';

  /** Rows when rendered as textarea. */
  rows?: number;

  /** Supporting text shown below the field when not in error state. */
  description?: string;

  /** Error text shown below the field. When provided, field is invalid. */
  error?: string;

  /** Whether the control is disabled. */
  disabled?: boolean;

  /** Whether the control is required. */
  required?: boolean;

  /** Whether the control is readonly. */
  readonly?: boolean;

  /** Name attribute for form submissions. */
  name?: string;

  /** Placeholder shown when value is empty. */
  placeholder?: string;
};

const generatedId = useId();
const attrs = useAttrs();
const slots = useSlots();

const props = withDefaults(defineProps<TextFieldProps>(), {
  label: undefined,
  id: undefined,
  as: 'input',
  rows: 3,
  description: undefined,
  error: undefined,
  disabled: false,
  required: false,
  readonly: false,
  name: undefined,
  placeholder: undefined,
});

const emit = defineEmits<{
  input: [event: Event];
  change: [event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
}>();

const modelValue = defineModel<string>({ required: true });

const inputId = computed(() => {
  return props.id ?? `m3-text-field-${generatedId}`;
});

const hasValue = computed(() => {
  return modelValue.value.length > 0;
});

const supportingMessage = computed(() => {
  return props.error ?? props.description;
});

const supportingId = computed(() => {
  return supportingMessage.value ? `${inputId.value}-supporting` : undefined;
});

const invalid = computed(() => {
  return Boolean(props.error);
});

const hasLeading = computed(() => {
  return Boolean(slots.leading);
});

const controlRef = ref<HTMLInputElement | HTMLTextAreaElement>();

const controlAttrs = computed(() => {
  const forwarded = { ...attrs };
  delete forwarded.class;
  delete forwarded.style;
  return forwarded;
});

const handleInput = (event: Event) => {
  emit('input', event);
};

const handleChange = (event: Event) => {
  emit('change', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event);
};

const focus = () => {
  controlRef.value?.focus();
};

const blur = () => {
  controlRef.value?.blur();
};

const select = () => {
  if (controlRef.value instanceof HTMLInputElement || controlRef.value instanceof HTMLTextAreaElement) {
    controlRef.value.select();
  }
};

defineExpose({
  el: controlRef,
  focus,
  blur,
  select,
});
</script>

<template>
  <div
    :class="'m3-text-field'"
    :data-invalid="invalid ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-populated="hasValue ? 'true' : 'false'"
    :data-has-placeholder="props.placeholder ? 'true' : 'false'"
    :data-has-leading="hasLeading ? 'true' : 'false'"
  >
    <div :class="'m3-text-field-container'">
      <label v-if="props.label" :class="'m3-text-field-label'" :for="inputId">{{ props.label }}</label>

      <span :class="'m3-text-field-content'">
        <span v-if="slots.leading" :class="'m3-text-field-leading-slot'">
          <slot name="leading" />
        </span>
        <span v-if="slots.prefix" :class="'m3-text-field-prefix-slot'">
          <slot name="prefix" />
        </span>

        <textarea
          v-if="props.as === 'textarea'"
          :id="inputId"
          ref="controlRef"
          v-model="modelValue"
          :class="['m3-text-field-input', 'm3-text-field-textarea']"
          :name="props.name"
          :rows="props.rows"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          :required="props.required"
          :readonly="props.readonly"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="supportingId"
          v-bind="controlAttrs"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />
        <input
          v-else
          :id="inputId"
          ref="controlRef"
          v-model="modelValue"
          :class="'m3-text-field-input'"
          :name="props.name"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          :required="props.required"
          :readonly="props.readonly"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="supportingId"
          v-bind="controlAttrs"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />

        <span v-if="slots.suffix" :class="'m3-text-field-suffix-slot'">
          <slot name="suffix" />
        </span>
        <span v-if="slots.trailing" :class="'m3-text-field-trailing-slot'">
          <slot name="trailing" />
        </span>
      </span>

      <fieldset :class="'m3-text-field-outline'" aria-hidden="true">
        <legend>
          <span>{{ props.label }}</span>
        </legend>
      </fieldset>
    </div>

    <div v-if="supportingMessage" :id="supportingId" :class="'m3-text-field-supporting'" aria-live="polite">
      {{ supportingMessage }}
    </div>
  </div>
</template>

<style src="./TextField.css"></style>
