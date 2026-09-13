import { type MaybeRefOrGetter, type Ref, computed, ref, toValue } from 'vue';

export type DatePickerModelValue = string | undefined;

export type DatePickerVariant = 'auto' | 'docked' | 'modal';

export type DateParts = {
  year: number;
  month: number;
  day: number;
};

export type CalendarDay = DateParts & {
  date: string;
  label: string;
  outsideMonth: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
};

export type DatePickerListOption = {
  selected: boolean;
  disabled: boolean;
};

export type DatePickerMonthOption = DatePickerListOption & {
  month: number;
  label: string;
};

export type DatePickerYearOption = DatePickerListOption & {
  year: number;
};

export type UseDatePickerOptions = {
  modelValue: Ref<DatePickerModelValue>;
  min?: MaybeRefOrGetter<string | undefined>;
  max?: MaybeRefOrGetter<string | undefined>;
  today?: MaybeRefOrGetter<string | undefined>;
  locale?: MaybeRefOrGetter<string | undefined>;
  firstDayOfWeek?: MaybeRefOrGetter<0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined>;
  onChange?: (value: DatePickerModelValue) => void;
  onConfirm?: (value: DatePickerModelValue) => void;
  onCancel?: () => void;
};

export type UseDatePickerReturn = ReturnType<typeof useDatePicker>;

export function useDatePicker(options: UseDatePickerOptions) {
  const calendarView = ref<'days' | 'months' | 'years'>('days');
  const draftValue = ref<DatePickerModelValue>();
  const displayedYear = ref(0);
  const displayedMonth = ref(0);

  const minDate = computed(() => {
    return parseIsoDate(toValue(options.min));
  });

  const maxDate = computed(() => {
    return parseIsoDate(toValue(options.max));
  });

  const todayDate = computed(() => {
    return normalizeIsoDate(toValue(options.today)) ?? getLocalIsoDate(new Date());
  });

  const selectedDate = computed(() => {
    return normalizeIsoDate(draftValue.value);
  });

  const locale = computed(() => {
    return toValue(options.locale);
  });

  const firstDayOfWeek = computed(() => {
    return toValue(options.firstDayOfWeek) ?? getLocaleFirstDayOfWeek(locale.value);
  });

  const shortMonthFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', month: 'short' });
  });

  const longMonthFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', month: 'long' });
  });

  const monthYearFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', month: 'long', year: 'numeric' });
  });

  const weekdayFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', weekday: 'narrow' });
  });

  const fullDateFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', dateStyle: 'full' });
  });

  const displayedMonthDate = computed(() => {
    return createLocalDate(displayedYear.value, displayedMonth.value, 1);
  });

  const monthButtonLabel = computed(() => {
    return shortMonthFormatter.value.format(displayedMonthDate.value);
  });

  const calendarLabel = computed(() => {
    return monthYearFormatter.value.format(displayedMonthDate.value);
  });

  const weekdayLabels = computed(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const dayIndex = (firstDayOfWeek.value + index) % 7;
      const date = createLocalDate(2024, 0, 7 + dayIndex);

      return {
        key: dayIndex,
        label: weekdayFormatter.value.format(date),
      };
    });
  });

  const calendarDays = computed<CalendarDay[]>(() => {
    const start = createLocalDate(displayedYear.value, displayedMonth.value, 1);
    const startOffset = (start.getDay() - firstDayOfWeek.value + 7) % 7;
    const firstVisibleDay = addDays(start, -startOffset);
    const selected = selectedDate.value;
    const today = todayDate.value;

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(firstVisibleDay, index);
      const isoDate = getLocalIsoDate(date);

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        date: isoDate,
        label: String(date.getDate()),
        outsideMonth: date.getMonth() !== displayedMonth.value,
        today: isoDate === today,
        selected: isoDate === selected,
        disabled: isDateDisabled(isoDate),
      };
    });
  });

  const monthOptions = computed<DatePickerMonthOption[]>(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const date = createLocalDate(displayedYear.value, month, 1);

      return {
        month,
        label: longMonthFormatter.value.format(date),
        selected: month === displayedMonth.value,
        disabled: isMonthDisabled(displayedYear.value, month),
      };
    });
  });

  const yearRange = computed(() => {
    const lower = minDate.value?.year ?? displayedYear.value - 100;
    const upper = maxDate.value?.year ?? displayedYear.value + 100;

    return {
      start: Math.min(lower, upper),
      end: Math.max(lower, upper),
    };
  });

  const yearOptions = computed<DatePickerYearOption[]>(() => {
    const { start, end } = yearRange.value;

    return Array.from({ length: end - start + 1 }, (_, index) => {
      const year = start + index;

      return {
        year,
        selected: year === displayedYear.value,
        disabled: isYearDisabled(year),
      };
    });
  });

  const canGoPreviousMonth = computed(() => {
    const min = toValue(options.min);
    const previousMonthLastDate = getLocalIsoDate(createLocalDate(displayedYear.value, displayedMonth.value, 0));

    return !minDate.value || compareIsoDates(previousMonthLastDate, min!) >= 0;
  });

  const canGoNextMonth = computed(() => {
    const max = toValue(options.max);
    const nextMonthFirstDate = getLocalIsoDate(createLocalDate(displayedYear.value, displayedMonth.value + 1, 1));

    return !maxDate.value || compareIsoDates(nextMonthFirstDate, max!) <= 0;
  });

  const canGoPreviousYear = computed(() => {
    const min = toValue(options.min);
    const previousYearLastDate = getLocalIsoDate(createLocalDate(displayedYear.value, 0, 0));

    return !minDate.value || compareIsoDates(previousYearLastDate, min!) >= 0;
  });

  const canGoNextYear = computed(() => {
    const max = toValue(options.max);
    const nextYearFirstDate = getLocalIsoDate(createLocalDate(displayedYear.value + 1, 0, 1));

    return !maxDate.value || compareIsoDates(nextYearFirstDate, max!) <= 0;
  });

  function isDateDisabled(date: string) {
    const min = toValue(options.min);
    const max = toValue(options.max);

    if (min && minDate.value && compareIsoDates(date, min) < 0) {
      return true;
    }

    if (max && maxDate.value && compareIsoDates(date, max) > 0) {
      return true;
    }

    return false;
  }

  function isMonthDisabled(year: number, month: number) {
    const min = toValue(options.min);
    const max = toValue(options.max);
    const monthFirstDate = getLocalIsoDate(createLocalDate(year, month, 1));
    const monthLastDate = getLocalIsoDate(createLocalDate(year, month + 1, 0));

    if (min && minDate.value && compareIsoDates(monthLastDate, min) < 0) {
      return true;
    }

    if (max && maxDate.value && compareIsoDates(monthFirstDate, max) > 0) {
      return true;
    }

    return false;
  }

  function isYearDisabled(year: number) {
    const min = toValue(options.min);
    const max = toValue(options.max);
    const yearFirstDate = getLocalIsoDate(createLocalDate(year, 0, 1));
    const yearLastDate = getLocalIsoDate(createLocalDate(year, 11, 31));

    if (min && minDate.value && compareIsoDates(yearLastDate, min) < 0) {
      return true;
    }

    if (max && maxDate.value && compareIsoDates(yearFirstDate, max) > 0) {
      return true;
    }

    return false;
  }

  function getInitialDisplayDate() {
    const preferred =
      normalizeIsoDate(options.modelValue.value) ?? normalizeIsoDate(toValue(options.today)) ?? todayDate.value;
    const parsed = parseIsoDate(preferred);

    return parsed ?? parseIsoDate(todayDate.value)!;
  }

  function setDisplayedMonthFromDate(date: string) {
    const parsed = parseIsoDate(date);

    if (!parsed) {
      return;
    }

    displayedYear.value = parsed.year;
    displayedMonth.value = parsed.month;
  }

  function resetDraftFromModel() {
    draftValue.value = options.modelValue.value;

    const date = normalizeIsoDate(options.modelValue.value);

    if (date) {
      setDisplayedMonthFromDate(date);
    }
  }

  function commitValue(value: DatePickerModelValue) {
    const normalizedValue = normalizeIsoDate(value);

    if (options.modelValue.value !== normalizedValue) {
      options.modelValue.value = normalizedValue;
      options.onChange?.(normalizedValue);
    }

    options.onConfirm?.(normalizedValue);
  }

  function confirmDraft() {
    commitValue(draftValue.value);
  }

  function cancelDraft() {
    resetDraftFromModel();
    options.onCancel?.();
  }

  function selectDate(date: string) {
    if (isDateDisabled(date)) {
      return;
    }

    draftValue.value = date;
    setDisplayedMonthFromDate(date);
  }

  function goToPreviousMonth() {
    if (!canGoPreviousMonth.value) {
      return;
    }

    const next = addMonths(displayedYear.value, displayedMonth.value, -1);
    displayedYear.value = next.year;
    displayedMonth.value = next.month;
    calendarView.value = 'days';
  }

  function goToNextMonth() {
    if (!canGoNextMonth.value) {
      return;
    }

    const next = addMonths(displayedYear.value, displayedMonth.value, 1);
    displayedYear.value = next.year;
    displayedMonth.value = next.month;
    calendarView.value = 'days';
  }

  function goToPreviousYear() {
    if (!canGoPreviousYear.value) {
      return;
    }

    displayedYear.value -= 1;
  }

  function goToNextYear() {
    if (!canGoNextYear.value) {
      return;
    }

    displayedYear.value += 1;
  }

  function toggleMonthView() {
    calendarView.value = calendarView.value === 'months' ? 'days' : 'months';
  }

  function toggleYearView() {
    calendarView.value = calendarView.value === 'years' ? 'days' : 'years';
  }

  function selectMonth(month: number) {
    if (isMonthDisabled(displayedYear.value, month)) {
      return;
    }

    displayedMonth.value = month;
    calendarView.value = 'days';
  }

  function selectYear(year: number) {
    if (isYearDisabled(year)) {
      return;
    }

    displayedYear.value = year;
    calendarView.value = 'months';
  }

  function getKeyboardDate(currentDate: string, key: string) {
    const current = dateFromIso(currentDate);

    switch (key) {
      case 'ArrowDown':
        return getLocalIsoDate(addDays(current, 7));
      case 'ArrowLeft':
        return getLocalIsoDate(addDays(current, -1));
      case 'ArrowRight':
        return getLocalIsoDate(addDays(current, 1));
      case 'ArrowUp':
        return getLocalIsoDate(addDays(current, -7));
      case 'End':
        return calendarDays.value.findLast((day) => !day.outsideMonth && !day.disabled)?.date;
      case 'Home':
        return calendarDays.value.find((day) => !day.outsideMonth && !day.disabled)?.date;
      case 'PageDown': {
        const next = addMonths(current.getFullYear(), current.getMonth(), 1);
        return getLocalIsoDate(createLocalDate(next.year, next.month, Math.min(current.getDate(), 28)));
      }
      case 'PageUp': {
        const next = addMonths(current.getFullYear(), current.getMonth(), -1);
        return getLocalIsoDate(createLocalDate(next.year, next.month, Math.min(current.getDate(), 28)));
      }
      default:
        return undefined;
    }
  }

  function getNavigationDate(currentDate: string, key: string) {
    const nextDate = getKeyboardDate(currentDate, key);

    if (!nextDate || isDateDisabled(nextDate)) {
      return undefined;
    }

    setDisplayedMonthFromDate(nextDate);
    return nextDate;
  }

  const initialDate = getInitialDisplayDate();
  displayedYear.value = initialDate.year;
  displayedMonth.value = initialDate.month;
  draftValue.value = options.modelValue.value;

  return {
    calendarView,
    draftValue,
    displayedYear,
    displayedMonth,
    todayDate,
    selectedDate,
    fullDateFormatter,
    monthButtonLabel,
    calendarLabel,
    weekdayLabels,
    calendarDays,
    monthOptions,
    yearOptions,
    canGoPreviousMonth,
    canGoNextMonth,
    canGoPreviousYear,
    canGoNextYear,
    dateFromIso,
    normalizeIsoDate,
    isDateDisabled,
    resetDraftFromModel,
    confirmDraft,
    cancelDraft,
    selectDate,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousYear,
    goToNextYear,
    toggleMonthView,
    toggleYearView,
    selectMonth,
    selectYear,
    getNavigationDate,
  };
}

export function createLocalDate(year: number, month: number, day: number) {
  return new Date(year, month, day);
}

export function getLocalIsoDate(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function parseIsoDate(value: unknown): DateParts | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  const day = Number(match[3]);
  const date = createLocalDate(year, monthNumber - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== monthNumber - 1 || date.getDate() !== day) {
    return undefined;
  }

  return {
    year,
    month: monthNumber - 1,
    day,
  };
}

export function normalizeIsoDate(value: unknown) {
  return parseIsoDate(value) ? (value as string) : undefined;
}

export function dateFromIso(value: string) {
  const parsed = parseIsoDate(value);
  return parsed ? createLocalDate(parsed.year, parsed.month, parsed.day) : new Date(NaN);
}

export function addDays(date: Date, days: number) {
  return createLocalDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMonths(year: number, month: number, delta: number) {
  const date = createLocalDate(year, month + delta, 1);

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

export function compareIsoDates(first: string, second: string) {
  return first.localeCompare(second);
}

export function getLocaleFirstDayOfWeek(locale?: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const resolvedLocale = new Intl.DateTimeFormat(locale).resolvedOptions().locale;
  const localeInfo = new Intl.Locale(resolvedLocale) as Intl.Locale & {
    weekInfo?: { firstDay: number };
    getWeekInfo?: () => { firstDay: number };
  };
  const weekInfo = localeInfo.getWeekInfo?.() ?? localeInfo.weekInfo;
  const firstDay = weekInfo?.firstDay;

  if (firstDay === 7) {
    return 0;
  }

  return firstDay === 1 || firstDay === 2 || firstDay === 3 || firstDay === 4 || firstDay === 5 || firstDay === 6
    ? firstDay
    : 0;
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}
