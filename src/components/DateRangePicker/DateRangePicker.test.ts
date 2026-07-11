// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import DateRangePicker, { type DateRangePickerModelValue } from './DateRangePicker.vue';

const popoverOpenElements = new WeakSet<HTMLElement>();

function installPopoverPolyfill() {
  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: (options?: { source?: HTMLElement }) => void;
    hidePopover?: () => void;
  };

  const originalMatches = Element.prototype.matches;

  Element.prototype.matches = function (this: Element, selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenElements.has(this as HTMLElement);
    }

    return originalMatches.call(this, selector);
  } as typeof Element.prototype.matches;

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value(this: HTMLElement) {
        popoverOpenElements.add(this);
        const toggleEvent = new Event('toggle');
        Object.defineProperty(toggleEvent, 'newState', {
          configurable: true,
          value: 'open',
        });
        this.dispatchEvent(toggleEvent);
      },
    });
  }

  if (typeof prototype.hidePopover !== 'function') {
    Object.defineProperty(prototype, 'hidePopover', {
      configurable: true,
      value(this: HTMLElement) {
        popoverOpenElements.delete(this);
        const toggleEvent = new Event('toggle');
        Object.defineProperty(toggleEvent, 'newState', {
          configurable: true,
          value: 'closed',
        });
        this.dispatchEvent(toggleEvent);
      },
    });
  }
}

function isPopoverOpen(element: HTMLElement | null) {
  return element ? popoverOpenElements.has(element) : false;
}

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
    expect(getDay('2026-04-12')?.dataset.inRange).toBe('true');
    expect(getDay('2026-04-12')?.getAttribute('aria-current')).toBe('date');

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
