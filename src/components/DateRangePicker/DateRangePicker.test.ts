// @vitest-environment jsdom
import { installPopoverPolyfill, isPopoverOpen } from '../../../tests/unit/popover';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { provideM3Locale } from '@/locales/context';
import DateRangePicker, { type DateRangePickerModelValue } from './DateRangePicker.vue';

function getDay(date: string) {
  return (
    document.body.querySelector<HTMLButtonElement>(
      `.m3-date-range-picker .m3-date-picker-day[data-date="${date}"]:not([data-outside-month="true"])`,
    ) ??
    document.body.querySelector<HTMLButtonElement>(`.m3-date-range-picker .m3-date-picker-day[data-date="${date}"]`)
  );
}

function getButton(label: string) {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => button.textContent?.trim() === label,
  );
}

beforeAll(() => {
  installPopoverPolyfill();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DateRangePicker', () => {
  it('opens the latest closed model through the component API and closes through hide', async () => {
    const value = ref({ start: '2026-04-15', end: '2026-04-20' });
    const open = ref(false);
    const picker = ref<InstanceType<typeof DateRangePicker>>();
    const host = document.createElement('div');
    document.body.appendChild(host);
    const app = createApp(() =>
      h(DateRangePicker, {
        ref: picker,
        modelValue: value.value,
        open: open.value,
        'onUpdate:open': (next) => {
          open.value = next;
        },
        locale: 'en-US',
      }),
    );
    app.mount(host);
    await nextTick();
    value.value = { start: '2026-05-14', end: '2026-05-19' };
    await nextTick();
    picker.value!.show();
    await nextTick();
    await nextTick();
    const root = document.querySelector<HTMLElement>('[data-scope="date-range-picker"][data-part="root"]')!;
    expect(open.value).toBe(true);
    expect(root.matches(':popover-open')).toBe(true);
    expect(root.querySelector('[data-date="2026-05-14"]')?.getAttribute('data-selected-start')).toBe('true');
    expect(root.querySelector('[data-date="2026-05-19"]')?.getAttribute('data-selected-end')).toBe('true');
    picker.value!.hide();
    await nextTick();
    expect(open.value).toBe(false);
    expect(root.matches(':popover-open')).toBe(false);
    app.unmount();
  });

  it('emits closed after its popover exit completes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const open = ref(true);
    const onClosed = vi.fn();
    const app = createApp(() =>
      h(DateRangePicker, {
        open: open.value,
        'onUpdate:open': (nextOpen: boolean) => {
          open.value = nextOpen;
        },
        onClosed,
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    document.body.querySelector<HTMLElement>('.m3-date-range-picker')?.hidePopover();
    await nextTick();
    await Promise.resolve();

    expect(open.value).toBe(false);
    expect(onClosed).toHaveBeenCalledOnce();
    app.unmount();
  });

  it('renders two consecutive calendar panes by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        modelValue: {
          start: '2026-04-10',
          end: '2026-04-14',
        },
        today: '2026-04-12',
        locale: 'en-US',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const panes = Array.from(document.body.querySelectorAll<HTMLElement>('[data-part="calendar-pane"]'));

    expect(panes).toHaveLength(2);
    expect(panes.map((pane) => pane.querySelector('[data-part="calendar-title"]')?.textContent?.trim())).toEqual([
      'April 2026',
      'May 2026',
    ]);

    app.unmount();
  });

  it('keeps localized calendar pages aligned with the Gregorian model calendar', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        calendars: 1,
        modelValue: {
          start: '2026-08-10',
          end: '2026-08-14',
        },
        today: '2026-08-12',
        locale: 'fa-IR',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const title = document.body.querySelector<HTMLElement>('[data-part="calendar-title"]');
    expect(title?.textContent).toContain('۲۰۲۶');
    expect(title?.textContent).not.toContain('۱۴۰۵');
    expect(document.body.querySelector<HTMLElement>('[data-part="year-switch"]')?.textContent).toContain('۲۰۲۶');
    expect(getDay('2026-08-12')?.textContent?.trim()).toBe('۱۲');

    app.unmount();
  });

  it('moves to enabled month edges from either calendar pane', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        modelValue: { start: '2026-04-10' },
        min: '2026-04-08',
        max: '2026-05-20',
        locale: 'en-US',
      }),
    );
    app.mount(container);
    await nextTick();
    await nextTick();

    const navigate = async (date: string, key: string) => {
      getDay(date)?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await nextTick();
      await nextTick();
    };

    await navigate('2026-04-10', 'Home');
    expect(document.activeElement).toBe(getDay('2026-04-08'));

    await navigate('2026-05-10', 'Home');
    expect(document.activeElement).toBe(getDay('2026-05-01'));

    await navigate('2026-05-01', 'End');
    expect(document.activeElement).toBe(getDay('2026-05-20'));
    app.unmount();
  });

  it('uses the locale week start by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        calendars: 1,
        modelValue: {
          start: '2026-08-10',
          end: '2026-08-14',
        },
        today: '2026-08-12',
        locale: 'en-GB',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const weekdays = Array.from(document.body.querySelectorAll<HTMLElement>('[data-part="weekday"]')).map((day) =>
      day.textContent?.trim(),
    );
    expect(weekdays).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);

    app.unmount();
  });

  it('can render a single calendar pane', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        calendars: 1,
        modelValue: {
          start: '2026-04-10',
          end: '2026-04-14',
        },
        today: '2026-04-12',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    expect(document.body.querySelectorAll('[data-part="calendar-pane"]')).toHaveLength(1);

    app.unmount();
  });

  it('renders a standalone popover with the initial range selected', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        modelValue: {
          start: '2026-04-10',
          end: '2026-04-14',
        },
        today: '2026-04-12',
        locale: 'en-US',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const popover = document.body.querySelector<HTMLElement>('.m3-date-range-picker');

    expect(isPopoverOpen(popover)).toBe(true);
    expect(popover?.parentElement).toBe(container);
    expect(getDay('2026-04-10')?.dataset.selectedStart).toBe('true');
    expect(getDay('2026-04-14')?.dataset.selectedEnd).toBe('true');
    expect(getDay('2026-04-10')?.getAttribute('aria-label')).toBe('Start date, Friday, April 10, 2026');
    expect(getDay('2026-04-14')?.getAttribute('aria-label')).toBe('End date, Tuesday, April 14, 2026');
    expect(getDay('2026-04-12')?.dataset.inRange).toBe('true');
    expect(getDay('2026-04-12')?.getAttribute('aria-current')).toBe('date');

    app.unmount();
  });

  it('updates the combined endpoint label when the localized message changes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const endpointLabel = ref('Whole range');
    const app = createApp({
      setup() {
        provideM3Locale({
          messages: () => {
            const label = endpointLabel.value;
            return { dateRangePicker: { startAndEndDate: (date) => `${label}: ${date}` } };
          },
        });

        return () =>
          h(DateRangePicker, {
            open: true,
            modelValue: { start: '2026-04-10', end: '2026-04-10' },
            today: '2026-04-12',
            locale: 'en-US',
          });
      },
    });
    app.mount(container);
    await nextTick();

    expect(getDay('2026-04-10')?.getAttribute('aria-label')).toBe('Whole range: Friday, April 10, 2026');
    endpointLabel.value = 'Selected day';
    await nextTick();
    expect(getDay('2026-04-10')?.getAttribute('aria-label')).toBe('Selected day: Friday, April 10, 2026');
    expect(getDay('2026-04-12')?.getAttribute('aria-label')).toBe('Sunday, April 12, 2026');

    app.unmount();
  });

  it('keeps the range as a draft until confirmed', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: DateRangePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<DateRangePickerModelValue>();

        return () =>
          h(DateRangePicker, {
            open: true,
            modelValue: value.value,
            today: '2026-04-10',
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as DateRangePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    getDay('2026-04-10')?.click();
    await nextTick();
    getDay('2026-04-14')?.click();
    await nextTick();

    expect(updates).toEqual([]);
    expect(getDay('2026-04-10')?.dataset.selectedStart).toBe('true');
    expect(getDay('2026-04-14')?.dataset.selectedEnd).toBe('true');
    expect(getDay('2026-04-12')?.dataset.inRange).toBe('true');

    getButton('OK')?.click();
    await nextTick();

    expect(updates).toEqual([
      {
        start: '2026-04-10',
        end: '2026-04-14',
      },
    ]);
    expect(isPopoverOpen(document.body.querySelector<HTMLElement>('.m3-date-range-picker'))).toBe(false);

    app.unmount();
  });

  it('edits the active end date without clearing the start date', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: DateRangePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<DateRangePickerModelValue>({
          start: '2026-04-10',
          end: '2026-04-14',
        });

        return () =>
          h(DateRangePicker, {
            open: true,
            modelValue: value.value,
            today: '2026-04-10',
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as DateRangePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    document.body.querySelector<HTMLButtonElement>('[data-part="end-selector"]')?.click();
    await nextTick();
    getDay('2026-04-12')?.click();
    await nextTick();

    expect(getDay('2026-04-10')?.dataset.selectedStart).toBe('true');
    expect(getDay('2026-04-12')?.dataset.selectedEnd).toBe('true');

    getButton('OK')?.click();
    await nextTick();

    expect(updates).toEqual([
      {
        start: '2026-04-10',
        end: '2026-04-12',
      },
    ]);

    app.unmount();
  });

  it('starts a new range when the second date is before the current start', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        today: '2026-04-10',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    getDay('2026-04-14')?.click();
    await nextTick();
    getDay('2026-04-10')?.click();
    await nextTick();

    expect(getDay('2026-04-10')?.dataset.selectedStart).toBe('true');
    expect(getDay('2026-04-10')?.dataset.selectedEnd).toBeUndefined();
    expect(getDay('2026-04-14')?.dataset.selected).toBeUndefined();
    expect(getDay('2026-04-12')?.dataset.inRange).toBeUndefined();

    app.unmount();
  });

  it('disables dates outside the min and max bounds', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DateRangePicker, {
        open: true,
        modelValue: {
          start: '2026-05-12',
          end: '2026-05-18',
        },
        min: '2026-05-01',
        max: '2026-05-31',
        today: '2026-05-12',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    expect(getDay('2026-04-30')?.disabled).toBe(true);
    expect(getDay('2026-05-01')?.disabled).toBe(false);
    expect(getDay('2026-05-31')?.disabled).toBe(false);
    expect(getDay('2026-06-01')?.disabled).toBe(true);

    app.unmount();
  });
});
