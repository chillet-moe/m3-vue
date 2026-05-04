import { type MaybeRefOrGetter, type Ref, computed, ref, toValue, watch } from 'vue';

export type TimePickerModelValue = string | undefined;

export type TimePickerVariant = 'auto' | 'docked' | 'modal';

export type TimePickerFormat = '12h' | '24h';

export type TimePickerInputMode = 'clock' | 'keyboard';

export type TimePickerSelection = 'hour' | 'minute';

export type TimePickerPeriod = 'AM' | 'PM';

export type ClockOption = {
  value: number;
  label: string;
  selected: boolean;
  angle: number;
  ring: 'inner' | 'outer';
};

export type TimeParts = {
  hour: number;
  minute: number;
};

export type UseTimePickerOptions = {
  modelValue: Ref<TimePickerModelValue>;
  format?: MaybeRefOrGetter<TimePickerFormat>;
  inputMode?: MaybeRefOrGetter<TimePickerInputMode | undefined>;
  onChange?: (value: TimePickerModelValue) => void;
  onConfirm?: (value: TimePickerModelValue) => void;
  onCancel?: () => void;
};

export type UseTimePickerReturn = ReturnType<typeof useTimePicker>;

export function useTimePicker(options: UseTimePickerOptions) {
  const draftHour = ref(0);
  const draftMinute = ref(0);
  const activeSelection = ref<TimePickerSelection>('hour');
  const inputHourText = ref('');
  const inputMinuteText = ref('');
  const inputHourTouched = ref(false);
  const inputMinuteTouched = ref(false);
  const inputSubmitted = ref(false);

  const format = computed(() => toValue(options.format) ?? '12h');

  const inputMode = computed<TimePickerInputMode>(() => {
    return toValue(options.inputMode) ?? (format.value === '24h' ? 'keyboard' : 'clock');
  });

  const period = computed<TimePickerPeriod>(() => (draftHour.value >= 12 ? 'PM' : 'AM'));

  const displayHour = computed(() => {
    if (format.value === '24h') {
      return padTimePart(draftHour.value);
    }

    const hour = draftHour.value % 12 || 12;
    return padTimePart(hour);
  });

  const displayMinute = computed(() => padTimePart(draftMinute.value));

  const selectedTime = computed(() => formatTimeParts(draftHour.value, draftMinute.value));

  const hourInputInvalid = computed(() => {
    if (!shouldValidateHourInput.value) {
      return false;
    }

    return parseInputHour(inputHourText.value) === undefined;
  });

  const minuteInputInvalid = computed(() => {
    if (!shouldValidateMinuteInput.value) {
      return false;
    }

    return parseInputMinute(inputMinuteText.value) === undefined;
  });

  const inputInvalid = computed(() => hourInputInvalid.value || minuteInputInvalid.value);

  const shouldValidateHourInput = computed(() => inputHourTouched.value || inputSubmitted.value);

  const shouldValidateMinuteInput = computed(() => inputMinuteTouched.value || inputSubmitted.value);

  const hourInputError = computed(() => {
    if (!hourInputInvalid.value) {
      return undefined;
    }

    if (inputHourText.value.length === 0) {
      return 'Enter hour';
    }

    return format.value === '24h' ? 'Use 0-23' : 'Use 1-12';
  });

  const minuteInputError = computed(() => {
    if (!minuteInputInvalid.value) {
      return undefined;
    }

    if (inputMinuteText.value.length === 0) {
      return 'Enter minute';
    }

    return 'Use 0-59';
  });

  const clockOptions = computed<ClockOption[]>(() => {
    if (activeSelection.value === 'minute') {
      return Array.from({ length: 12 }, (_, index) => {
        const value = index * 5;

        return {
          value,
          label: padTimePart(value),
          selected: value === roundMinuteForDial(draftMinute.value),
          angle: value * 6,
          ring: 'outer',
        };
      });
    }

    if (format.value === '24h') {
      return Array.from({ length: 24 }, (_, value) => ({
        value,
        label: padTimePart(value),
        selected: value === draftHour.value,
        angle: (value % 12) * 30,
        ring: value >= 12 ? 'inner' : 'outer',
      }));
    }

    return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => ({
      value,
      label: String(value),
      selected: value === (draftHour.value % 12 || 12),
      angle: (value % 12) * 30,
      ring: 'outer',
    }));
  });

  const clockHandAngle = computed(() => {
    if (activeSelection.value === 'minute') {
      return draftMinute.value * 6;
    }

    return (draftHour.value % 12) * 30;
  });

  const clockHandRing = computed<'inner' | 'outer'>(() => {
    if (activeSelection.value === 'hour' && format.value === '24h' && draftHour.value >= 12) {
      return 'inner';
    }

    return 'outer';
  });

  function syncInputFromDraft() {
    inputHourText.value = displayHour.value;
    inputMinuteText.value = displayMinute.value;
    inputHourTouched.value = false;
    inputMinuteTouched.value = false;
    inputSubmitted.value = false;
  }

  function resetDraftFromModel() {
    const parsed = parseTimeValue(options.modelValue.value) ?? { hour: 0, minute: 0 };
    draftHour.value = parsed.hour;
    draftMinute.value = parsed.minute;
    activeSelection.value = 'hour';
    syncInputFromDraft();
  }

  function commitValue(value: TimePickerModelValue) {
    const normalizedValue = normalizeTimeValue(value);

    if (options.modelValue.value !== normalizedValue) {
      options.modelValue.value = normalizedValue;
      options.onChange?.(normalizedValue);
    }

    options.onConfirm?.(normalizedValue);
  }

  function confirmDraft() {
    inputSubmitted.value = true;

    if (!applyInputText()) {
      return false;
    }

    commitValue(selectedTime.value);
    return true;
  }

  function cancelDraft() {
    resetDraftFromModel();
    options.onCancel?.();
  }

  function selectHour(value: number, advanceSelection = true) {
    if (format.value === '24h') {
      draftHour.value = clamp(value, 0, 23);
    } else {
      const hour12 = value % 12;
      draftHour.value = period.value === 'PM' ? hour12 + 12 : hour12;
    }

    if (advanceSelection) {
      activeSelection.value = 'minute';
    }

    syncInputFromDraft();
  }

  function selectMinute(value: number) {
    draftMinute.value = clamp(value, 0, 59);
    syncInputFromDraft();
  }

  function setPeriod(nextPeriod: TimePickerPeriod) {
    const currentlyPm = draftHour.value >= 12;

    if (nextPeriod === 'PM' && !currentlyPm) {
      draftHour.value += 12;
    } else if (nextPeriod === 'AM' && currentlyPm) {
      draftHour.value -= 12;
    }

    syncInputFromDraft();
  }

  function setInputHourText(value: string) {
    inputHourTouched.value = true;
    inputHourText.value = value.replace(/\D/g, '').slice(0, 2);
  }

  function setInputMinuteText(value: string) {
    inputMinuteTouched.value = true;
    inputMinuteText.value = value.replace(/\D/g, '').slice(0, 2);
  }

  function touchInput(selection: TimePickerSelection) {
    if (selection === 'hour') {
      inputHourTouched.value = true;
      return;
    }

    inputMinuteTouched.value = true;
  }

  function applyInputText() {
    const nextHour = parseInputHour(inputHourText.value);
    const nextMinute = parseInputMinute(inputMinuteText.value);

    if (nextHour === undefined || nextMinute === undefined) {
      return false;
    }

    draftHour.value = nextHour;
    draftMinute.value = nextMinute;
    syncInputFromDraft();
    return true;
  }

  function parseInputHour(value: string) {
    if (!/^\d{1,2}$/.test(value)) {
      return undefined;
    }

    const numberValue = Number(value);

    if (format.value === '24h') {
      return numberValue >= 0 && numberValue <= 23 ? numberValue : undefined;
    }

    if (numberValue < 1 || numberValue > 12) {
      return undefined;
    }

    const hour12 = numberValue % 12;
    return period.value === 'PM' ? hour12 + 12 : hour12;
  }

  function parseInputMinute(value: string) {
    if (!/^\d{1,2}$/.test(value)) {
      return undefined;
    }

    const numberValue = Number(value);
    return numberValue >= 0 && numberValue <= 59 ? numberValue : undefined;
  }

  watch(format, () => {
    syncInputFromDraft();
  });

  resetDraftFromModel();

  return {
    draftHour,
    draftMinute,
    activeSelection,
    inputHourText,
    inputMinuteText,
    format,
    inputMode,
    period,
    displayHour,
    displayMinute,
    selectedTime,
    hourInputInvalid,
    minuteInputInvalid,
    inputInvalid,
    hourInputError,
    minuteInputError,
    clockOptions,
    clockHandAngle,
    clockHandRing,
    normalizeTimeValue,
    resetDraftFromModel,
    confirmDraft,
    cancelDraft,
    selectHour,
    selectMinute,
    setPeriod,
    setInputHourText,
    setInputMinuteText,
    touchInput,
    applyInputText,
  };
}

export function parseTimeValue(value: unknown): TimeParts | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(value);

  if (!match) {
    return undefined;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return undefined;
  }

  return { hour, minute };
}

export function normalizeTimeValue(value: unknown) {
  const parsed = parseTimeValue(value);
  return parsed ? formatTimeParts(parsed.hour, parsed.minute) : undefined;
}

export function formatTimeParts(hour: number, minute: number) {
  return `${padTimePart(clamp(hour, 0, 23))}:${padTimePart(clamp(minute, 0, 59))}`;
}

export function padTimePart(value: number) {
  return String(value).padStart(2, '0');
}

function roundMinuteForDial(value: number) {
  return (Math.round(value / 5) * 5) % 60;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
