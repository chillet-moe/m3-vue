import { type MaybeRefOrGetter, type Ref, computed, ref, toValue } from 'vue';
import type { DatePickerVariant } from '@/components/DatePicker/useDatePicker';
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
import { en } from '@/locales/en';
import type { M3Messages } from '@/locales/types';
import { useCalendarNavigation } from '../useCalendarNavigation';

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
  const draftValue = ref<DateRangePickerModelValue>();
  const activeSelection = ref<DateRangePickerSelection>('start');

  const minDate = computed(() => {
    return normalizeIsoDate(toValue(options.min));
  });

  const maxDate = computed(() => {
    return normalizeIsoDate(toValue(options.max));
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

  const { numberFormatter, setDisplayedMonthFromDate, ...navigation } = useCalendarNavigation({
    initialDate: getInitialDisplayDate(),
    minDate,
    maxDate,
    locale,
  });
  const { displayedYear, displayedMonth } = navigation;
  const displayedMonthDate = computed(() => createLocalDate(displayedYear.value, displayedMonth.value, 1));

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

  const mediumDateFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', dateStyle: 'medium' });
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

  function createMonthDays(monthDate: Date) {
    const min = minDate.value;
    const max = maxDate.value;
    return createCalendarMonthDays({
      year: monthDate.getFullYear(),
      month: monthDate.getMonth(),
      firstDayOfWeek: firstDayOfWeek.value,
      today: todayDate.value,
      numberFormatter: numberFormatter.value,
      isDateDisabled: (date) => isDateOutsideBounds(date, min, max),
    });
  }

  function createMonthHeading(monthDate: Date) {
    return {
      key: getLocalIsoDate(monthDate),
      label: monthYearFormatter.value.format(monthDate),
    };
  }

  function trackMonth(monthOffset: number) {
    const date = computed(() => getDisplayedMonthDate(monthOffset));
    const days = computed(() => createMonthDays(date.value));
    const heading = computed(() => createMonthHeading(date.value));
    const labels = computed(() => formatCalendarDayLabels(days.value, fullDateFormatter.value));
    return { days, heading, labels };
  }

  const calendarMonths = [trackMonth(0), trackMonth(1)];

  function getMonthDays(monthOffset: number) {
    return calendarMonths[monthOffset]?.days.value ?? createMonthDays(getDisplayedMonthDate(monthOffset));
  }

  function getCalendarDayLabels(monthOffset: number): readonly string[] {
    return (
      calendarMonths[monthOffset]?.labels.value ??
      formatCalendarDayLabels(getMonthDays(monthOffset), fullDateFormatter.value)
    );
  }

  const calendarDays = computed<DateRangePickerCalendarDay[]>(() => {
    return getCalendarDays(0);
  });

  function getCalendarPage(monthOffset: number): DateRangePickerCalendarPage {
    const heading =
      calendarMonths[monthOffset]?.heading.value ?? createMonthHeading(getDisplayedMonthDate(monthOffset));

    return {
      ...heading,
      days: getCalendarDays(monthOffset),
    };
  }

  function getCalendarDays(monthOffset: number): DateRangePickerCalendarDay[] {
    const selectedStart = selectedStartDate.value;
    const selectedEnd = selectedEndDate.value;

    return getMonthDays(monthOffset).map(({ year, month, day, date, label, outsideMonth, today, disabled }) => {
      const isSelectedStart = date === selectedStart;
      const isSelectedEnd = date === selectedEnd;
      const inRange = Boolean(
        selectedStart &&
        selectedEnd &&
        compareIsoDates(date, selectedStart) >= 0 &&
        compareIsoDates(date, selectedEnd) <= 0,
      );

      return {
        year,
        month,
        day,
        date,
        label,
        outsideMonth,
        today,
        selected: isSelectedStart || isSelectedEnd,
        selectedStart: isSelectedStart,
        selectedEnd: isSelectedEnd,
        inRange,
        rangeStart: isSelectedStart && Boolean(selectedEnd),
        rangeEnd: isSelectedEnd && Boolean(selectedStart),
        disabled,
      };
    });
  }

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

  function getInitialDisplayDate() {
    const range = normalizeDateRange(options.modelValue.value);
    const preferred = range?.start ?? range?.end ?? normalizeIsoDate(toValue(options.today)) ?? todayDate.value;
    const parsed = parseIsoDate(preferred);

    return parsed ?? parseIsoDate(todayDate.value)!;
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
      case 'Home': {
        const offset = (current.getFullYear() - displayedYear.value) * 12 + current.getMonth() - displayedMonth.value;
        const days = getMonthDays(offset);
        const isEnabledDateInMonth = (day: (typeof days)[number]) => !day.outsideMonth && !day.disabled;
        return (key === 'Home' ? days.find(isEnabledDateInMonth) : days.findLast(isEnabledDateInMonth))?.date;
      }
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

  function getDateAriaLabel(date: string, dateLabel?: string) {
    const formattedDate = dateLabel ?? fullDateFormatter.value.format(dateFromIso(date));
    const isStart = selectedStartDate.value === date;
    const isEnd = selectedEndDate.value === date;
    if (!isStart && !isEnd) return formattedDate;

    const messages = toValue(options.messages) ?? en.messages.dateRangePicker;
    if (isStart && isEnd) return messages.startAndEndDate(formattedDate);
    return isStart ? messages.selectedStartDate(formattedDate) : messages.selectedEndDate(formattedDate);
  }

  resetDraftFromModel();

  return {
    ...navigation,
    draftValue,
    draftRange,
    activeSelection,
    todayDate,
    selectedStartDate,
    selectedEndDate,
    fullDateFormatter,
    mediumDateFormatter,
    calendarLabel,
    weekdayLabels,
    calendarDays,
    getCalendarDayLabels,
    getCalendarPage,
    getCalendarDays,
    dateFromIso,
    normalizeDateRange,
    isDateDisabled,
    resetDraftFromModel,
    confirmDraft,
    cancelDraft,
    setActiveSelection,
    selectDate,
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
