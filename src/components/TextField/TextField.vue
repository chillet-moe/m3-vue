<script setup lang="ts">
import { computed, useId } from 'vue';

export type TextFieldProps = {
  /** Text field label displayed inside container. */
  label: string;

  /** Optional explicit id for native input element. */
  id?: string;

  /** Native input type for single-line mode. */
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

  /** Whether to use a multiline textarea. */
  multiline?: boolean;

  /** Rows for multiline textarea. */
  rows?: number;

  /** Leading icon name. */
  leadingIcon?: string;

  /** Trailing icon name. */
  trailingIcon?: string;

  /** Prefix text before the input value. */
  prefixText?: string;

  /** Suffix text after the input value. */
  suffixText?: string;

  /** Supporting text shown below the field. */
  supportingText?: string;

  /** Error text shown below the field when invalid. */
  errorText?: string;

  /** Whether the input is disabled. */
  disabled?: boolean;

  /** Whether the field is in error state. */
  invalid?: boolean;

  /** Whether the input is required. */
  required?: boolean;

  /** Whether the input is readonly. */
  readonly?: boolean;

  /** Name attribute for form submissions. */
  name?: string;

  /** Placeholder shown when value is empty. */
  placeholder?: string;

  /** ARIA label for cases without visible label. */
  ariaLabel?: string;
};

const generatedId = useId();

const props = withDefaults(defineProps<TextFieldProps>(), {
  id: undefined,
  type: 'text',
  multiline: false,
  rows: 3,
  leadingIcon: undefined,
  trailingIcon: undefined,
  prefixText: undefined,
  suffixText: undefined,
  supportingText: undefined,
  errorText: undefined,
  disabled: false,
  invalid: false,
  required: false,
  readonly: false,
  name: undefined,
  placeholder: undefined,
  ariaLabel: undefined,
});

const value = defineModel<string>({ required: true });

const inputId = computed(() => {
  return props.id ?? `m3-text-field-${generatedId}`;
});

const hasValue = computed(() => {
  return value.value.length > 0;
});

const supportingMessage = computed(() => {
  return props.invalid ? props.errorText : props.supportingText;
});

const supportingId = computed(() => {
  return supportingMessage.value ? `${inputId.value}-supporting` : undefined;
});
</script>

<template>
  <div
    :class="'m3-text-field'"
    :data-invalid="props.invalid ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-populated="hasValue ? 'true' : 'false'"
    :data-has-placeholder="props.placeholder ? 'true' : 'false'"
    :data-has-leading-icon="props.leadingIcon ? 'true' : 'false'"
  >
    <label :class="'m3-text-field-container'" :for="inputId">
      <span :class="'m3-text-field-label'">{{ props.label }}</span>

      <span :class="'m3-text-field-content'">
        <span v-if="props.leadingIcon" :class="['m3-icon', 'm3-text-field-icon', 'm3-text-field-leading-icon']">{{ props.leadingIcon }}</span>
        <span v-if="props.prefixText" :class="'m3-text-field-prefix'">{{ props.prefixText }}</span>

        <textarea
          v-if="props.multiline"
          :id="inputId"
          v-model="value"
          :class="['m3-text-field-input', 'm3-text-field-textarea']"
          :name="props.name"
          :rows="props.rows"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          :required="props.required"
          :readonly="props.readonly"
          :aria-invalid="props.invalid ? 'true' : undefined"
          :aria-describedby="supportingId"
          :aria-label="props.ariaLabel"
        />
        <input
          v-else
          :id="inputId"
          v-model="value"
          :class="'m3-text-field-input'"
          :type="props.type"
          :name="props.name"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          :required="props.required"
          :readonly="props.readonly"
          :aria-invalid="props.invalid ? 'true' : undefined"
          :aria-describedby="supportingId"
          :aria-label="props.ariaLabel"
        />

        <span v-if="props.suffixText" :class="'m3-text-field-suffix'">{{ props.suffixText }}</span>
        <span v-if="props.trailingIcon" :class="['m3-icon', 'm3-text-field-icon', 'm3-text-field-trailing-icon']">{{ props.trailingIcon }}</span>
      </span>

      <fieldset :class="'m3-text-field-outline'" aria-hidden="true">
        <legend>
          <span>{{ props.label }}</span>
        </legend>
      </fieldset>
    </label>

    <div v-if="supportingMessage" :id="supportingId" :class="'m3-text-field-supporting'" aria-live="polite">
      {{ supportingMessage }}
    </div>
  </div>
</template>

<style src="./TextField.css"></style>
