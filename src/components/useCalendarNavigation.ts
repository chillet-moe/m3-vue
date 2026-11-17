import { computed, ref, type Ref } from 'vue';
import {
  addMonths,
  compareIsoDates,
  createLocalDate,
  getLocalIsoDate,
  parseIsoDate,
  type DateParts,
} from './calendarDate';

export type DatePickerListOption = {
  value: number;
  label: string;
  selected: boolean;
  disabled: boolean;
};

type CalendarNavigationOptions = {
  initialDate: DateParts;
  minDate: Readonly<Ref<string | undefined>>;
  maxDate: Readonly<Ref<string | undefined>>;
  locale: Readonly<Ref<string | undefined>>;
};

export function useCalendarNavigation({ initialDate, minDate, maxDate, locale }: CalendarNavigationOptions) {
  const calendarView = ref<'days' | 'months' | 'years'>('days');
  const displayedYear = ref(initialDate.year);
  const displayedMonth = ref(initialDate.month);

  const shortMonthFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', month: 'short' });
  });

  const longMonthFormatter = computed(() => {
    return new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', month: 'long' });
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

  const monthOptions = computed<DatePickerListOption[]>(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const date = createLocalDate(displayedYear.value, month, 1);

      return {
        value: month,
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

  const yearOptions = computed<DatePickerListOption[]>(() => {
    const { start, end } = yearRange.value;

    return Array.from({ length: end - start + 1 }, (_, index) => {
      const year = start + index;

      return {
        value: year,
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

  function setDisplayedMonthFromDate(date: string) {
    const parsed = parseIsoDate(date);

    if (!parsed) {
      return;
    }

    displayedYear.value = parsed.year;
    displayedMonth.value = parsed.month;
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

  return {
    calendarView,
    displayedYear,
    displayedMonth,
    monthButtonLabel,
    displayedYearLabel,
    monthOptions,
    yearOptions,
    canGoPreviousMonth,
    canGoNextMonth,
    canGoPreviousYear,
    canGoNextYear,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousYear,
    goToNextYear,
    toggleMonthView,
    toggleYearView,
    selectMonth,
    selectYear,
    numberFormatter,
    setDisplayedMonthFromDate,
  };
}
