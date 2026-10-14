<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, unref, useAttrs, useId, useSlots, watch } from 'vue';
import {
  DatePicker,
  type DatePickerModelValue,
  type DatePickerVariant,
  normalizeIsoDate,
} from '@/components/DatePicker';
import IconButton from '@/components/IconButton/IconButton.vue';
import {
  normalizeTimeValue,
  TimePicker,
  type TimePickerFormat,
  type TimePickerInputMode,
  type TimePickerModelValue,
  type TimePickerVariant,
} from '@/components/TimePicker';
import { fieldContextKey, useFieldLabelClearanceStyle, useFieldSize } from '@/components/TextField/FieldContext';
import { acquireAnchorName } from '@/internal/anchorName';
import { useM3Locale } from '@/locales/context';

export type TextFieldSize = 'extra-small' | 'small' | 'medium';

type TextFieldSharedProps = {
  /** Visible label. If omitted, provide aria-label via attrs. */
  label?: string;

  /** Optional explicit id for native control element. */
  id?: string;

  /** Native input type. Date and datetime-local use DatePicker. Time uses TimePicker. */
  type?: string;

  /** The shape of the text field. Matches Button shape sizes. */
  shape?: 'rounded' | 'square';

  /** CSS length reserved at block-start for the floating label. Overrides FieldContext. */
  labelClearance?: string;

  /** Rows when rendered as textarea. */
  rows?: number;

  /** Supporting text shown below the field when not in error state. */
  supportingText?: string;

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

  /** TimePicker variant when type is time. */
  timePickerVariant?: TimePickerVariant;

  /** TimePicker format when type is time. */
  timePickerFormat?: TimePickerFormat;

  /** TimePicker input mode when type is time. */
  timePickerInputMode?: TimePickerInputMode;
};

export type TextFieldSingleLineProps = TextFieldSharedProps & {
  as?: 'input';
  size?: TextFieldSize;
};

export type TextFieldMultilineProps = TextFieldSharedProps & {
  as: 'textarea';
  size?: 'medium';
};

export type TextFieldProps = TextFieldSharedProps & {
  /** Render either a single-line input or multiline textarea. */
  as?: 'input' | 'textarea';

  /**
   * The field height. Matches the 32px, 40px, and 56px Button sizes.
   * Multiline fields only support medium; TextFieldMultilineProps expresses that constraint for typed wrappers.
   */
  size?: TextFieldSize;
};

const generatedId = useId();
const attrs = useAttrs();
const slots = useSlots();
const { messages } = useM3Locale();

const props = withDefaults(defineProps<TextFieldProps>(), {
  label: undefined,
  id: undefined,
  as: 'input',
  size: undefined,
  type: 'text',
  shape: undefined,
  labelClearance: undefined,
  rows: 3,
  supportingText: undefined,
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
  timePickerVariant: 'auto',
  timePickerFormat: '24h',
  timePickerInputMode: undefined,
});

const fieldContext = inject(fieldContextKey, undefined);
const labelClearanceStyle = useFieldLabelClearanceStyle(() => props.labelClearance);
const shape = computed(() => props.shape ?? unref(fieldContext?.shape) ?? 'square');

const emit = defineEmits<{
  input: [event: Event];
  change: [event: Event];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
}>();

const modelValue = defineModel<string>({ required: true });
const controlRef = ref<HTMLInputElement | HTMLTextAreaElement>();

// Vue's dynamic native v-model parses type="number" values before invoking the setter. Read the control's textual value
// at that boundary so the model preserves native input.value semantics while retaining v-model's composition handling.
const nativeControlValue = computed<string, string | number>({
  get() {
    return modelValue.value;
  },
  set(nextValue) {
    modelValue.value = controlRef.value?.value ?? String(nextValue);
  },
});

const inputId = computed(() => {
  return props.id ?? `m3-text-field-${generatedId}`;
});

const hasValue = computed(() => {
  return modelValue.value.length > 0;
});

const inheritedSize = useFieldSize(() => props.size);
const effectiveSize = computed<TextFieldSize>(() => {
  return props.as === 'textarea' ? 'medium' : inheritedSize.value;
});

const supportingMessage = computed(() => {
  return props.error || props.supportingText;
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
const datePickerOpen = ref(false);
const timePickerOpen = ref(false);
const datePickerAnchorName = `--m3-text-field-date-picker-anchor-${generatedId}`;
const timePickerAnchorName = `--m3-text-field-time-picker-anchor-${generatedId}`;
let releasePickerAnchorName: (() => void) | undefined;

const normalizedInputType = computed(() => {
  return props.type.toLowerCase();
});

const hasDatePicker = computed(() => {
  return (
    props.as === 'input' && (normalizedInputType.value === 'date' || normalizedInputType.value === 'datetime-local')
  );
});

const hasTimePicker = computed(() => {
  return props.as === 'input' && normalizedInputType.value === 'time';
});

const hasPicker = computed(() => {
  return hasDatePicker.value || hasTimePicker.value;
});

const nativeInputType = computed(() => {
  return hasPicker.value ? 'text' : props.type;
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

const timePickerValue = computed<TimePickerModelValue>({
  get() {
    return normalizeTimeValue(modelValue.value);
  },
  set(nextValue) {
    modelValue.value = nextValue ?? '';
  },
});

const pickerId = computed(() => {
  if (hasDatePicker.value) {
    return `${inputId.value}-date-picker`;
  }

  if (hasTimePicker.value) {
    return `${inputId.value}-time-picker`;
  }

  return undefined;
});

const controlAttrs = computed(() => {
  const forwarded = { ...attrs };
  delete forwarded.class;
  delete forwarded.style;
  return forwarded;
});

const pickerAnchorName = computed(() => {
  if (hasDatePicker.value) {
    return datePickerAnchorName;
  }

  if (hasTimePicker.value) {
    return timePickerAnchorName;
  }

  return undefined;
});

watch(
  [containerRef, pickerAnchorName],
  ([nextContainer, nextAnchorName]) => {
    releasePickerAnchorName?.();
    releasePickerAnchorName =
      nextContainer && nextAnchorName ? acquireAnchorName(nextContainer, nextAnchorName) : undefined;
  },
  {
    immediate: true,
    flush: 'post',
  },
);

onBeforeUnmount(() => {
  releasePickerAnchorName?.();
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
  if (hasPicker.value && !props.disabled && !props.readonly) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
      return;
    }

    if (event.key === 'Escape') {
      closePicker();
    }
  }

  emit('keydown', event);
};

const handleControlClick = () => {
  if (!hasPicker.value || props.disabled || props.readonly) {
    return;
  }

  openPicker();
};

function openPicker() {
  if (hasDatePicker.value) {
    datePickerOpen.value = true;
    return;
  }

  if (hasTimePicker.value) {
    timePickerOpen.value = true;
  }
}

function closePicker() {
  datePickerOpen.value = false;
  timePickerOpen.value = false;
}

const handlePickerButtonClick = () => {
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
    :data-shape="shape"
    :data-size="effectiveSize"
    :data-multiline="props.as === 'textarea' ? 'true' : 'false'"
    :data-populated="hasValue ? 'true' : 'false'"
    :data-visually-focused="props.visuallyFocused ? 'true' : 'false'"
    :data-has-placeholder="props.placeholder ? 'true' : 'false'"
    :data-always-float-label="props.alwaysFloatLabel ? 'true' : 'false'"
    :data-has-leading="hasLeading ? 'true' : 'false'"
    :data-has-date-picker="hasDatePicker ? 'true' : 'false'"
    :data-has-time-picker="hasTimePicker ? 'true' : 'false'"
    :style="labelClearanceStyle"
  >
    <div ref="containerRef" :class="'m3-text-field-container'" data-scope="text-field" data-part="container">
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
          v-model="nativeControlValue"
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
          v-model="nativeControlValue"
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
          :aria-controls="pickerId"
          :aria-expanded="
            hasDatePicker
              ? datePickerOpen
                ? 'true'
                : 'false'
              : hasTimePicker
                ? timePickerOpen
                  ? 'true'
                  : 'false'
                : undefined
          "
          :aria-haspopup="hasPicker ? 'dialog' : undefined"
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
          v-if="slots.trailing || hasPicker"
          :class="'m3-text-field-trailing-slot'"
          data-scope="text-field"
          data-part="trailing"
        >
          <slot name="trailing" />
          <IconButton
            v-if="hasPicker"
            class="m3-text-field-date-picker-button"
            :icon="hasTimePicker ? 'schedule' : 'calendar_today'"
            variant="standard"
            size="small"
            :disabled="props.disabled || props.readonly"
            :aria-label="hasTimePicker ? messages.timePicker.chooseTime : messages.datePicker.chooseDate"
            @click.stop="handlePickerButtonClick"
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
      :variant="props.datePickerVariant"
      :anchor-name="datePickerAnchorName"
      :anchor-element="containerRef"
      :min="datePickerMin"
      :max="datePickerMax"
      :aria-label="messages.textField.openDatePicker(props.label)"
    />

    <TimePicker
      v-if="hasTimePicker"
      :id="`${inputId}-time-picker`"
      v-model="timePickerValue"
      v-model:open="timePickerOpen"
      :variant="props.timePickerVariant"
      :format="props.timePickerFormat"
      :input-mode="props.timePickerInputMode"
      :anchor-name="timePickerAnchorName"
      :anchor-element="containerRef"
      :aria-label="messages.textField.openTimePicker(props.label)"
    />
  </div>
</template>

<style src="./TextField.css"></style>
