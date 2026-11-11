import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useDatePicker } from './DatePicker/useDatePicker';
import { useDateRangePicker } from './DateRangePicker/useDateRangePicker';

describe.each([
  {
    name: 'DatePicker',
    create: (min: () => string | undefined, max?: () => string | undefined) =>
      useDatePicker({ modelValue: ref('2026-04-15'), min, max }),
  },
  {
    name: 'DateRangePicker',
    create: (min: () => string | undefined, max?: () => string | undefined) =>
      useDateRangePicker({ modelValue: ref({ start: '2026-04-15' }), min, max }),
  },
])('$name day bounds', ({ create }) => {
  it('uses reactive bounds consistently for days, navigation, and month/year choices', () => {
    const min = ref<string | undefined>('invalid');
    const max = ref<string | undefined>('2026-02-30');
    const picker = create(
      () => min.value,
      () => max.value,
    );
    const dates = ['2026-04-09', '2026-04-10', '2026-04-20', '2026-04-21'];
    const checkBounds = (bounded: boolean) => {
      const disabled = bounded ? [true, false, false, true] : [false, false, false, false];
      expect(dates.map(picker.isDateDisabled)).toEqual(disabled);
      expect(dates.map((date) => picker.calendarDays.value.find((day) => day.date === date)?.disabled)).toEqual(
        disabled,
      );
      expect([
        picker.canGoPreviousMonth.value,
        picker.canGoNextMonth.value,
        picker.canGoPreviousYear.value,
        picker.canGoNextYear.value,
      ]).toEqual(Array(4).fill(!bounded));
      expect([0, 3, 11].map((month) => picker.monthOptions.value[month]?.disabled)).toEqual([bounded, false, bounded]);
      expect([picker.yearOptions.value[0]?.year, picker.yearOptions.value.at(-1)?.year]).toEqual(
        bounded ? [2026, 2026] : [1926, 2126],
      );
    };

    checkBounds(false);
    min.value = '2026-04-10';
    max.value = '2026-04-20';
    checkBounds(true);
    min.value = undefined;
    max.value = 'invalid';
    checkBounds(false);
  });
});
