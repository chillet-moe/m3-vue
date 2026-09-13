import { type MaybeRefOrGetter, type Ref, computed, ref, toValue } from 'vue';
import {
  type DateParts,
  type DatePickerMonthOption,
  type DatePickerVariant,
  type DatePickerYearOption,
  addDays,
  addMonths,
  compareIsoDates,
  createLocalDate,
  dateFromIso,
  getLocalIsoDate,
  getLocaleFirstDayOfWeek,
  normalizeIsoDate,
  parseIsoDate,
} from '@/components/DatePicker/useDatePicker';
import { en } from '@/locales/en';
import type { M3Messages } from '@/locales/types';

export type DateRangePickerVariant = DatePickerVariant;

export type DateRangePickerCalendars = 1 | 2 | 'auto';

export type DateRangePickerRangeValue = {
  /** Range start date, formatted as YYYY-MM-DD. */
  start?: string;

  /** Range end date, formatted as YYYY-MM-DD. */
  end?: string;
};

export type DateRangePickerModelValue = DateRangePickerRangeValue | undefined;

export type DateRangePickerSelection = 'start' | 'end';

export type DateRangePickerCalendarDay = DateParts & {
  date: string;
  label: string;
  outsideMonth: boolean;
  today: boolean;
  selected: boolean;
  selectedStart: boolean;
  selectedEnd: boolean;
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  disabled: boolean;
};

export type DateRangePickerCalendarPage = {
  key: string;
  label: string;
  days: DateRangePickerCalendarDay[];
};

export type UseDateRangePickerOptions = {
  modelValue: Ref<DateRangePickerModelValue>;
  min?: MaybeRefOrGetter<string | undefined>;
  max?: MaybeRefOrGetter<string | undefined>;
  today?: MaybeRefOrGetter<string | undefined>;
  locale?: MaybeRefOrGetter<string | undefined>;
  firstDayOfWeek?: MaybeRefOrGetter<0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined>;
  messages?: MaybeRefOrGetter<
    Pick<M3Messages['dateRangePicker'], 'startAndEndDate' | 'selectedStartDate' | 'selectedEndDate'>
  >;
  onChange?: (value: DateRangePickerModelValue) => void;
  onConfirm?: (value: DateRangePickerModelValue) => void;
  onCancel?: () => void;
};

export type UseDateRangePickerReturn = ReturnType<typeof useDateRangePicker>;

export function useDateRangePicker(options: UseDateRangePickerOptions) {
  const calendarView = ref<'days' | 'months' | 'years'>('days');
  const draftValue = ref<DateRangePickerModelValue>();
  const activeSelection = ref<DateRangePickerSelection>('start');
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

  const draftRange = computed(() => {
    return normalizeDateRange(draftValue.value);
  });

  const selectedStartDate = computed(() => {
    return draftRange.value?.start;
  });

  const selectedEndDate = computed(() => {
    return draftRange.value?.end;
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

  const mediumDateFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', dateStyle: 'medium' });
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

  function getDisplayedMonthDate(monthOffset: number) {
    return createLocalDate(displayedYear.value, displayedMonth.value + monthOffset, 1);
  }

  const calendarDays = computed<DateRangePickerCalendarDay[]>(() => {
    return getCalendarDays(0);
  });

  function getCalendarPage(monthOffset: number): DateRangePickerCalendarPage {
    const monthDate = getDisplayedMonthDate(monthOffset);

    return {
      key: getLocalIsoDate(monthDate),
      label: monthYearFormatter.value.format(monthDate),
      days: getCalendarDays(monthOffset),
    };
  }

  function getCalendarDays(monthOffset: number): DateRangePickerCalendarDay[] {
    const monthDate = getDisplayedMonthDate(monthOffset);
    return getCalendarDaysForMonth(monthDate.getFullYear(), monthDate.getMonth());
  }

  function getCalendarDaysForMonth(visibleYear: number, visibleMonth: number): DateRangePickerCalendarDay[] {
    const start = createLocalDate(visibleYear, visibleMonth, 1);
    const startOffset = (start.getDay() - firstDayOfWeek.value + 7) % 7;
    const firstVisibleDay = addDays(start, -startOffset);
    const selectedStart = selectedStartDate.value;
    const selectedEnd = selectedEndDate.value;
    const today = todayDate.value;
    const hasCompleteRange = Boolean(selectedStart && selectedEnd);

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(firstVisibleDay, index);
      const isoDate = getLocalIsoDate(date);
      const isSelectedStart = isoDate === selectedStart;
      const isSelectedEnd = isoDate === selectedEnd;
      const selected = isSelectedStart || isSelectedEnd;
      const inRange =
        Boolean(hasCompleteRange && selectedStart && selectedEnd) &&
        compareIsoDates(isoDate, selectedStart!) >= 0 &&
        compareIsoDates(isoDate, selectedEnd!) <= 0;

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        date: isoDate,
        label: String(date.getDate()),
        outsideMonth: date.getMonth() !== visibleMonth,
        today: isoDate === today,
        selected,
        selectedStart: isSelectedStart,
        selectedEnd: isSelectedEnd,
        inRange,
        rangeStart: isSelectedStart && Boolean(selectedEnd),
        rangeEnd: isSelectedEnd && Boolean(selectedStart),
        disabled: isDateDisabled(isoDate),
      };
    });
  }

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
    const range = normalizeDateRange(options.modelValue.value);
    const preferred = range?.start ?? range?.end ?? normalizeIsoDate(toValue(options.today)) ?? todayDate.value;
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
    const range = normalizeDateRange(options.modelValue.value);

    draftValue.value = range;
    activeSelection.value = range?.start && !range.end ? 'end' : 'start';

    const date = range?.start ?? range?.end;

    if (date) {
      setDisplayedMonthFromDate(date);
    }
  }

  function commitValue(value: DateRangePickerModelValue) {
    const normalizedValue = normalizeDateRange(value);

    if (!areDateRangesEqual(options.modelValue.value, normalizedValue)) {
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

  function setActiveSelection(selection: DateRangePickerSelection) {
    activeSelection.value = selection;
  }

  function selectDate(date: string) {
    if (isDateDisabled(date)) {
      return;
    }

    const range = normalizeDateRange(draftValue.value);

    if (activeSelection.value === 'start') {
      if (range?.end && compareIsoDates(date, range.end) <= 0) {
        draftValue.value = normalizeDateRange({
          start: date,
          end: range.end,
        });
        activeSelection.value = 'end';
        setDisplayedMonthFromDate(date);
        return;
      }

      draftValue.value = { start: date };
      activeSelection.value = 'end';
      setDisplayedMonthFromDate(date);
      return;
    }

    if (!range?.start) {
      draftValue.value = { start: date };
      activeSelection.value = 'end';
      setDisplayedMonthFromDate(date);
      return;
    }

    if (compareIsoDates(date, range.start) < 0) {
      draftValue.value = { start: date };
      activeSelection.value = 'end';
      setDisplayedMonthFromDate(date);
      return;
    }

    draftValue.value = normalizeDateRange({
      start: range.start,
      end: date,
    });
    activeSelection.value = 'start';
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
        return getCalendarDaysForMonth(current.getFullYear(), current.getMonth()).findLast(
          (day) => !day.outsideMonth && !day.disabled,
        )?.date;
      case 'Home':
        return getCalendarDaysForMonth(current.getFullYear(), current.getMonth()).find(
          (day) => !day.outsideMonth && !day.disabled,
        )?.date;
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

  function getDateAriaLabel(date: string) {
    const formattedDate = fullDateFormatter.value.format(dateFromIso(date));
    const messages = toValue(options.messages) ?? en.messages.dateRangePicker;

    if (selectedStartDate.value === date && selectedEndDate.value === date) {
      return messages.startAndEndDate(formattedDate);
    }

    if (selectedStartDate.value === date) {
      return messages.selectedStartDate(formattedDate);
    }

    if (selectedEndDate.value === date) {
      return messages.selectedEndDate(formattedDate);
    }

    return formattedDate;
  }

  const initialDate = getInitialDisplayDate();
  displayedYear.value = initialDate.year;
  displayedMonth.value = initialDate.month;
  resetDraftFromModel();

  return {
    calendarView,
    draftValue,
    draftRange,
    activeSelection,
    displayedYear,
    displayedMonth,
    todayDate,
    selectedStartDate,
    selectedEndDate,
    fullDateFormatter,
    mediumDateFormatter,
    monthButtonLabel,
    calendarLabel,
    weekdayLabels,
    calendarDays,
    getCalendarPage,
    getCalendarDays,
    monthOptions,
    yearOptions,
    canGoPreviousMonth,
    canGoNextMonth,
    canGoPreviousYear,
    canGoNextYear,
    dateFromIso,
    normalizeDateRange,
    isDateDisabled,
    resetDraftFromModel,
    confirmDraft,
    cancelDraft,
    setActiveSelection,
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
    getDateAriaLabel,
  };
}

export function normalizeDateRange(value: unknown): DateRangePickerModelValue {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as DateRangePickerRangeValue;
  const start = normalizeIsoDate(candidate.start);
  const end = normalizeIsoDate(candidate.end);

  if (!start && !end) {
    return undefined;
  }

  if (start && end && compareIsoDates(start, end) > 0) {
    return {
      start: end,
      end: start,
    };
  }

  return {
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
  };
}

export function areDateRangesEqual(first: DateRangePickerModelValue, second: DateRangePickerModelValue) {
  const normalizedFirst = normalizeDateRange(first);
  const normalizedSecond = normalizeDateRange(second);

  return (
    (normalizedFirst?.start ?? undefined) === (normalizedSecond?.start ?? undefined) &&
    (normalizedFirst?.end ?? undefined) === (normalizedSecond?.end ?? undefined)
  );
}
