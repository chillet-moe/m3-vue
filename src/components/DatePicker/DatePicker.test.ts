// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import DatePicker, { type DatePickerModelValue } from './DatePicker.vue';

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

function getDay(_container: HTMLElement, date: string) {
  return document.body.querySelector<HTMLButtonElement>(`.m3-date-picker-day[data-date="${date}"]`);
}

function getButton(_container: HTMLElement, label: string) {
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

describe('DatePicker', () => {
  it('renders a standalone popover and honors initial open state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DatePicker, {
        open: true,
        modelValue: '2026-04-28',
        today: '2026-04-28',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const popover = document.body.querySelector<HTMLElement>('.m3-date-picker');
    const selectedDay = getDay(container, '2026-04-28');

    expect(isPopoverOpen(popover)).toBe(true);
    expect(popover?.parentElement).toBe(container);
    expect(selectedDay?.dataset.selected).toBe('true');
    expect(selectedDay?.getAttribute('aria-current')).toBe('date');

    app.unmount();
  });

  it('keeps selection as a draft until confirmed', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: DatePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<DatePickerModelValue>('2026-04-28');

        return () =>
          h(DatePicker, {
            open: true,
            modelValue: value.value,
            today: '2026-04-28',
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as DatePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    getDay(container, '2026-04-30')?.click();
    await nextTick();

    expect(updates).toEqual([]);
    expect(getDay(container, '2026-04-30')?.dataset.selected).toBe('true');

    getButton(container, 'OK')?.click();
    await nextTick();

    expect(updates).toEqual(['2026-04-30']);
    expect(isPopoverOpen(document.body.querySelector<HTMLElement>('.m3-date-picker'))).toBe(false);

    app.unmount();
  });

  it('disables dates outside the min and max bounds', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DatePicker, {
        open: true,
        modelValue: '2026-05-12',
        min: '2026-05-01',
        max: '2026-05-31',
        today: '2026-05-12',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    expect(getDay(container, '2026-04-30')?.disabled).toBe(true);
    expect(getDay(container, '2026-05-01')?.disabled).toBe(false);
    expect(getDay(container, '2026-05-31')?.disabled).toBe(false);
    expect(getDay(container, '2026-06-01')?.disabled).toBe(true);

    app.unmount();
  });

  it('switches to the month list and selects a month', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DatePicker, {
        open: true,
        modelValue: '2026-08-17',
        today: '2026-08-17',
        locale: 'en-US',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    document.body.querySelector<HTMLButtonElement>('[data-part="month-switch"]')?.click();
    await nextTick();

    const selectedMonth = document.body.querySelector<HTMLButtonElement>(
      '.m3-date-picker-list-item[data-selected="true"]',
    );
    expect(selectedMonth?.textContent?.trim()).toBe('checkAugust');

    getButton(container, 'May')?.click();
    await nextTick();

    expect(getDay(container, '2026-05-17')).not.toBeNull();

    app.unmount();
  });

  it('keeps localized labels aligned with the Gregorian model calendar', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(DatePicker, {
        open: true,
        modelValue: '2026-08-17',
        today: '2026-08-17',
        locale: 'fa-IR',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const calendar = document.body.querySelector<HTMLElement>('[data-part="grid"]');
    expect(calendar?.getAttribute('aria-label')).toContain('۲۰۲۶');
    expect(calendar?.getAttribute('aria-label')).not.toContain('۱۴۰۵');
    expect(document.body.querySelector<HTMLElement>('[data-part="year-switch"]')?.textContent).toContain('۲۰۲۶');
    expect(getDay(container, '2026-08-17')?.textContent?.trim()).toBe('۱۷');

    app.unmount();
  });

  it('uses the locale week start unless explicitly overridden', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const locale = ref('en-GB');
    const firstDayOfWeek = ref<0 | undefined>();
    const app = createApp(() =>
      h(DatePicker, {
        open: true,
        modelValue: '2026-08-17',
        today: '2026-08-17',
        locale: locale.value,
        firstDayOfWeek: firstDayOfWeek.value,
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const getWeekdays = () =>
      Array.from(document.body.querySelectorAll<HTMLElement>('[data-part="weekday"]')).map((day) =>
        day.textContent?.trim(),
      );

    expect(getWeekdays()).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);

    firstDayOfWeek.value = 0;
    await nextTick();

    expect(getWeekdays()).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);

    app.unmount();
  });
});
