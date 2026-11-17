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
import { useCalendarNavigation } from '../useCalendarNavigation';

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

export type { DatePickerListOption } from '../useCalendarNavigation';

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
  const draftValue = ref<DatePickerModelValue>();

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
    const preferred =
      normalizeIsoDate(options.modelValue.value) ?? normalizeIsoDate(toValue(options.today)) ?? todayDate.value;
    const parsed = parseIsoDate(preferred);

    return parsed ?? parseIsoDate(todayDate.value)!;
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

  draftValue.value = options.modelValue.value;

  return {
    ...navigation,
    draftValue,
    todayDate,
    selectedDate,
    fullDateFormatter,
    calendarLabel,
    weekdayLabels,
    calendarDays,
    calendarDayLabels,
    dateFromIso,
    normalizeIsoDate,
    isDateDisabled,
    resetDraftFromModel,
    confirmDraft,
    cancelDraft,
    selectDate,
    getNavigationDate,
  };
}
