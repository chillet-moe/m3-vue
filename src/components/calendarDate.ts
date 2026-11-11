export type DateParts = {
  year: number;
  month: number;
  day: number;
};

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
  return getFirstDayOfResolvedLocale(new Intl.DateTimeFormat(locale).resolvedOptions().locale);
}

export function getFirstDayOfResolvedLocale(locale: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const localeInfo = new Intl.Locale(locale) as Intl.Locale & {
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

export function createCalendarMonthDays({
  year,
  month,
  firstDayOfWeek,
  today,
  numberFormatter,
  isDateDisabled,
}: {
  year: number;
  month: number;
  firstDayOfWeek: number;
  today: string;
  numberFormatter: Intl.NumberFormat;
  isDateDisabled: (date: string) => boolean;
}) {
  const start = createLocalDate(year, month, 1);
  const startOffset = (start.getDay() - firstDayOfWeek + 7) % 7;
  const firstVisibleDay = addDays(start, -startOffset);
  const formatNumber = numberFormatter.format;

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstVisibleDay, index);
    const isoDate = getLocalIsoDate(date);
    const day = date.getDate();
    const dayMonth = date.getMonth();

    return {
      year: date.getFullYear(),
      month: dayMonth,
      day,
      date: isoDate,
      timestamp: date.getTime(),
      label: formatNumber(day),
      outsideMonth: dayMonth !== month,
      today: isoDate === today,
      disabled: isDateDisabled(isoDate),
    };
  });
}

export function formatCalendarDayLabels(
  days: readonly { year: number; date: string; timestamp: number }[],
  formatter: Intl.DateTimeFormat,
) {
  const formatDate = formatter.format;
  // Keep label formatting aligned with the model's four-digit ISO dates.
  return days.map(({ year, date, timestamp }) =>
    formatDate(year >= 1000 && year <= 9999 ? timestamp : dateFromIso(date)),
  );
}
