<script setup lang="ts">
import { computed, ref, useAttrs, useId, useSlots } from 'vue';
import {
  DatePicker,
  type DatePickerModelValue,
  type DatePickerVariant,
  normalizeIsoDate,
} from '@/components/DatePicker';
import IconButton from '@/components/IconButton/IconButton.vue';

export type TextFieldProps = {
  /** Visible label. If omitted, provide aria-label via attrs. */
  label?: string;

  /** Optional explicit id for native control element. */
  id?: string;

  /** Render either a single-line input or multiline textarea. */
  as?: 'input' | 'textarea';

  /** Native input type. Date and datetime-local use the library DatePicker. */
  type?: string;

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

  /** Minimum value for compatible input types. */
  min?: string;

  /** Maximum value for compatible input types. */
  max?: string;

  /** Placeholder shown when value is empty. */
  placeholder?: string;

  /** Always render the label in the floating position. */
  alwaysFloatLabel?: boolean;

  /** Forces the visual focused state without requiring DOM focus. */
  visuallyFocused?: boolean;

  /** DatePicker variant when type is date or datetime-local. */
  datePickerVariant?: DatePickerVariant;
};

const generatedId = useId();
const attrs = useAttrs();
const slots = useSlots();

const props = withDefaults(defineProps<TextFieldProps>(), {
  label: undefined,
  id: undefined,
  as: 'input',
  type: 'text',
  rows: 3,
  description: undefined,
  error: undefined,
  disabled: false,
  required: false,
  readonly: false,
  name: undefined,
  min: undefined,
  max: undefined,
  placeholder: undefined,
  alwaysFloatLabel: false,
  visuallyFocused: false,
  datePickerVariant: 'auto',
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
  return props.error || props.description;
});

const hasSupporting = computed(() => {
  return Boolean(supportingMessage.value || slots.supporting);
});

const supportingId = computed(() => {
  return hasSupporting.value ? `${inputId.value}-supporting` : undefined;
});

const invalid = computed(() => {
  return Boolean(props.error);
});

const hasLeading = computed(() => {
  return Boolean(slots.leading);
});

const rootRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();
const controlRef = ref<HTMLInputElement | HTMLTextAreaElement>();
const datePickerOpen = ref(false);
const datePickerAnchorName = `--m3-text-field-date-picker-anchor-${generatedId}`;

const normalizedInputType = computed(() => {
  return props.type.toLowerCase();
});

const hasDatePicker = computed(() => {
  return (
    props.as === 'input' && (normalizedInputType.value === 'date' || normalizedInputType.value === 'datetime-local')
  );
});

const nativeInputType = computed(() => {
  return hasDatePicker.value ? 'text' : props.type;
});

const datePickerMin = computed(() => {
  return normalizeDateLikeValue(props.min);
});

const datePickerMax = computed(() => {
  return normalizeDateLikeValue(props.max);
});

const datePickerValue = computed<DatePickerModelValue>({
  get() {
    return normalizeDateLikeValue(modelValue.value);
  },
  set(nextValue) {
    if (!nextValue) {
      modelValue.value = '';
      return;
    }

    if (normalizedInputType.value === 'datetime-local') {
      const time = modelValue.value.includes('T') ? modelValue.value.slice(modelValue.value.indexOf('T') + 1) : '00:00';
      modelValue.value = `${nextValue}T${time || '00:00'}`;
      return;
    }

    modelValue.value = nextValue;
  },
});

const controlAttrs = computed(() => {
  const forwarded = { ...attrs };
  delete forwarded.class;
  delete forwarded.style;
  return forwarded;
});

const containerStyle = computed(() => {
  return hasDatePicker.value ? { 'anchor-name': datePickerAnchorName } : undefined;
});

function normalizeDateLikeValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return normalizeIsoDate(value.slice(0, 10));
}

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
  if (hasDatePicker.value && !props.disabled && !props.readonly) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      datePickerOpen.value = true;
      return;
    }

    if (event.key === 'Escape') {
      datePickerOpen.value = false;
    }
  }

  emit('keydown', event);
};

const handleControlClick = () => {
  if (!hasDatePicker.value || props.disabled || props.readonly) {
    return;
  }

  datePickerOpen.value = true;
};

const handleDatePickerButtonClick = () => {
  controlRef.value?.focus();
  handleControlClick();
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
  rootEl: rootRef,
  containerEl: containerRef,
  el: controlRef,
  focus,
  blur,
  select,
});
</script>

<template>
  <div
    ref="rootRef"
    :class="'m3-text-field'"
    data-scope="text-field"
    data-part="root"
    :data-invalid="invalid ? 'true' : 'false'"
    :data-disabled="props.disabled ? 'true' : 'false'"
    :data-populated="hasValue ? 'true' : 'false'"
    :data-visually-focused="props.visuallyFocused ? 'true' : 'false'"
    :data-has-placeholder="props.placeholder ? 'true' : 'false'"
    :data-always-float-label="props.alwaysFloatLabel ? 'true' : 'false'"
    :data-has-leading="hasLeading ? 'true' : 'false'"
    :data-has-date-picker="hasDatePicker ? 'true' : 'false'"
  >
    <div
      ref="containerRef"
      :class="'m3-text-field-container'"
      data-scope="text-field"
      data-part="container"
      :style="containerStyle"
    >
      <label
        v-if="props.label"
        :class="'m3-text-field-label'"
        data-scope="text-field"
        data-part="label"
        :for="inputId"
        >{{ props.label }}</label
      >

      <span :class="'m3-text-field-content'" data-scope="text-field" data-part="content">
        <span v-if="slots.leading" :class="'m3-text-field-leading-slot'" data-scope="text-field" data-part="leading">
          <slot name="leading" />
        </span>
        <span v-if="slots.prefix" :class="'m3-text-field-prefix-slot'" data-scope="text-field" data-part="prefix">
          <slot name="prefix" />
        </span>

        <textarea
          v-if="props.as === 'textarea'"
          :id="inputId"
          ref="controlRef"
          v-model="modelValue"
          :class="['m3-text-field-input', 'm3-text-field-textarea']"
          data-scope="text-field"
          data-part="input"
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
          data-scope="text-field"
          data-part="input"
          :name="props.name"
          :type="nativeInputType"
          :min="props.min"
          :max="props.max"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          :required="props.required"
          :readonly="props.readonly"
          :aria-invalid="invalid ? 'true' : undefined"
          :aria-describedby="supportingId"
          :aria-controls="hasDatePicker ? `${inputId}-date-picker` : undefined"
          :aria-expanded="hasDatePicker ? (datePickerOpen ? 'true' : 'false') : undefined"
          :aria-haspopup="hasDatePicker ? 'dialog' : undefined"
          v-bind="controlAttrs"
          @click="handleControlClick"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />

        <span v-if="slots.suffix" :class="'m3-text-field-suffix-slot'" data-scope="text-field" data-part="suffix">
          <slot name="suffix" />
        </span>
        <span
          v-if="slots.trailing || hasDatePicker"
          :class="'m3-text-field-trailing-slot'"
          data-scope="text-field"
          data-part="trailing"
        >
          <slot name="trailing" />
          <IconButton
            v-if="hasDatePicker"
            class="m3-text-field-date-picker-button m3-state-layer"
            icon="calendar_today"
            color="standard"
            size="small"
            :disabled="props.disabled || props.readonly"
            aria-label="Choose date"
            @click.stop="handleDatePickerButtonClick"
          />
        </span>
      </span>

      <fieldset :class="'m3-text-field-outline'" data-scope="text-field" data-part="outline" aria-hidden="true">
        <legend v-if="props.label">{{ props.label }}</legend>
      </fieldset>
    </div>

    <div
      v-if="hasSupporting"
      :id="supportingId"
      :class="'m3-text-field-supporting'"
      data-scope="text-field"
      data-part="supporting"
      aria-live="polite"
    >
      <slot name="supporting">{{ supportingMessage }}</slot>
    </div>

    <DatePicker
      v-if="hasDatePicker"
      :id="`${inputId}-date-picker`"
      v-model="datePickerValue"
      v-model:open="datePickerOpen"
      data-scope="text-field"
      data-part="date-picker"
      :variant="props.datePickerVariant"
      :anchor-name="datePickerAnchorName"
      :anchor-element="containerRef"
      :min="datePickerMin"
      :max="datePickerMax"
      :aria-label="props.label ? `Choose ${props.label}` : 'Choose date'"
    />
  </div>
</template>

<style src="./TextField.css"></style>
