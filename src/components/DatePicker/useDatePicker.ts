import { type MaybeRefOrGetter, type Ref, computed, ref, toValue } from 'vue';
import {
  addDays,
  addMonths,
  compareIsoDates,
  createCalendarMonthDays,
  createLocalDate,
  dateFromIso,
  formatCalendarDayLabels,
  getFirstDayOfResolvedLocale,
  getLocalIsoDate,
  normalizeIsoDate,
  parseIsoDate,
  type DateParts,
} from '../calendarDate';

export {
  addDays,
  addMonths,
  compareIsoDates,
  createLocalDate,
  dateFromIso,
  getLocalIsoDate,
  getLocaleFirstDayOfWeek,
  normalizeIsoDate,
  parseIsoDate,
  type DateParts,
} from '../calendarDate';

export type DatePickerModelValue = string | undefined;

export type DatePickerVariant = 'auto' | 'docked' | 'modal';

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
  label: string;
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
    return normalizeIsoDate(toValue(options.min));
  });

  const maxDate = computed(() => {
    return normalizeIsoDate(toValue(options.max));
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

  const firstDayOfWeek = computed(() => {
    return (
      toValue(options.firstDayOfWeek) ?? getFirstDayOfResolvedLocale(weekdayFormatter.value.resolvedOptions().locale)
    );
  });

  const fullDateFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', dateStyle: 'full' });
  });

  const numberFormatter = computed(() => {
    return new Intl.NumberFormat(locale.value, { useGrouping: false });
  });

  const displayedMonthDate = computed(() => {
    return createLocalDate(displayedYear.value, displayedMonth.value, 1);
  });

  const monthButtonLabel = computed(() => {
    return shortMonthFormatter.value.format(displayedMonthDate.value);
  });

  const displayedYearLabel = computed(() => {
    return numberFormatter.value.format(displayedYear.value);
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

  const monthDays = computed(() => {
    const min = minDate.value;
    const max = maxDate.value;
    return createCalendarMonthDays({
      year: displayedYear.value,
      month: displayedMonth.value,
      firstDayOfWeek: firstDayOfWeek.value,
      today: todayDate.value,
      numberFormatter: numberFormatter.value,
      isDateDisabled: (date) => isDateOutsideBounds(date, min, max),
    });
  });
  const calendarDayLabels = computed<readonly string[]>(() =>
    formatCalendarDayLabels(monthDays.value, fullDateFormatter.value),
  );
  const calendarDays = computed<CalendarDay[]>(() => {
    const selected = selectedDate.value;
    return monthDays.value.map(({ year, month, day, date, label, outsideMonth, today, disabled }) => ({
      year,
      month,
      day,
      date,
      label,
      outsideMonth,
      today,
      selected: date === selected,
      disabled,
    }));
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
    const lower = minDate.value ? Number(minDate.value.slice(0, 4)) : displayedYear.value - 100;
    const upper = maxDate.value ? Number(maxDate.value.slice(0, 4)) : displayedYear.value + 100;

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
        label: numberFormatter.value.format(year),
        selected: year === displayedYear.value,
        disabled: isYearDisabled(year),
      };
    });
  });

  const canGoPreviousMonth = computed(() => {
    const min = minDate.value;
    const previousMonthLastDate = getLocalIsoDate(createLocalDate(displayedYear.value, displayedMonth.value, 0));

    return !min || compareIsoDates(previousMonthLastDate, min) >= 0;
  });

  const canGoNextMonth = computed(() => {
    const max = maxDate.value;
    const nextMonthFirstDate = getLocalIsoDate(createLocalDate(displayedYear.value, displayedMonth.value + 1, 1));

    return !max || compareIsoDates(nextMonthFirstDate, max) <= 0;
  });

  const canGoPreviousYear = computed(() => {
    const min = minDate.value;
    const previousYearLastDate = getLocalIsoDate(createLocalDate(displayedYear.value, 0, 0));

    return !min || compareIsoDates(previousYearLastDate, min) >= 0;
  });

  const canGoNextYear = computed(() => {
    const max = maxDate.value;
    const nextYearFirstDate = getLocalIsoDate(createLocalDate(displayedYear.value + 1, 0, 1));

    return !max || compareIsoDates(nextYearFirstDate, max) <= 0;
  });

  function isDateDisabled(date: string) {
    return isDateOutsideBounds(date, minDate.value, maxDate.value);
  }

  function isDateOutsideBounds(date: string, min: string | undefined, max: string | undefined) {
    if (min && compareIsoDates(date, min) < 0) {
      return true;
    }

    if (max && compareIsoDates(date, max) > 0) {
      return true;
    }

    return false;
  }

  function isMonthDisabled(year: number, month: number) {
    const min = minDate.value;
    const max = maxDate.value;
    const monthFirstDate = getLocalIsoDate(createLocalDate(year, month, 1));
    const monthLastDate = getLocalIsoDate(createLocalDate(year, month + 1, 0));

    if (min && compareIsoDates(monthLastDate, min) < 0) {
      return true;
    }

    if (max && compareIsoDates(monthFirstDate, max) > 0) {
      return true;
    }

    return false;
  }

  function isYearDisabled(year: number) {
    const min = minDate.value;
    const max = maxDate.value;
    const yearFirstDate = getLocalIsoDate(createLocalDate(year, 0, 1));
    const yearLastDate = getLocalIsoDate(createLocalDate(year, 11, 31));

    if (min && compareIsoDates(yearLastDate, min) < 0) {
      return true;
    }

    if (max && compareIsoDates(yearFirstDate, max) > 0) {
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
        return monthDays.value.findLast((day) => !day.outsideMonth && !day.disabled)?.date;
      case 'Home':
        return monthDays.value.find((day) => !day.outsideMonth && !day.disabled)?.date;
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
    displayedYearLabel,
    calendarLabel,
    weekdayLabels,
    calendarDays,
    calendarDayLabels,
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
