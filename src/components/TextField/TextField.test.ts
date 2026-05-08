// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import TextField from './TextField.vue';

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

function getDatePickerButton(_container: HTMLElement, date: string) {
  return document.body.querySelector<HTMLButtonElement>(`.m3-date-picker-day[data-date="${date}"]`);
}

describe('TextField', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the supporting slot and wires it to aria-describedby', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref('');

        return () =>
          h(
            TextField,
            {
              label: 'Amount',
              modelValue: value.value,
              'onUpdate:modelValue': (nextValue) => {
                value.value = nextValue as string;
              },
            },
            {
              supporting: () => 'Custom supporting text',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-text-field-input');
    const supporting = container.querySelector<HTMLElement>('.m3-text-field-supporting');

    expect(supporting?.textContent?.trim()).toBe('Custom supporting text');
    expect(input?.getAttribute('aria-describedby')).toBeTruthy();
    expect(supporting?.id).toBe(input?.getAttribute('aria-describedby'));

    app.unmount();
  });

  it('falls back to the error text when no supporting slot is provided', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        error: 'Amount is required',
        description: 'Helper text',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector('.m3-text-field-supporting')?.textContent?.trim()).toBe('Amount is required');

    app.unmount();
  });

  it('renders description when error is an empty string', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        error: '',
        description: 'Helper text',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector('.m3-text-field-supporting')?.textContent?.trim()).toBe('Helper text');

    app.unmount();
  });

  it('marks the label to always float when requested', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        alwaysFloatLabel: true,
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-text-field');

    expect(root?.dataset.alwaysFloatLabel).toBe('true');
    expect(root?.dataset.populated).toBe('false');

    app.unmount();
  });

  it('exposes the requested shape state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        shape: 'square',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector<HTMLElement>('.m3-text-field')?.dataset.shape).toBe('square');

    app.unmount();
  });

  it('uses square shape by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector<HTMLElement>('.m3-text-field')?.dataset.shape).toBe('square');

    app.unmount();
  });

  it('opens the library DatePicker for date inputs and updates the date value on confirmation', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref('2026-04-28');

        return () =>
          h(TextField, {
            label: 'Date',
            type: 'date',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as string;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-text-field-input');
    const datePicker = document.body.querySelector<HTMLElement>('.m3-date-picker');

    expect(input?.type).toBe('text');

    input?.click();
    await nextTick();
    await nextTick();

    expect(isPopoverOpen(datePicker)).toBe(true);

    getDatePickerButton(container, '2026-04-30')?.click();
    await nextTick();

    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'OK')
      ?.click();
    await nextTick();

    expect(input?.value).toBe('2026-04-30');
    expect(isPopoverOpen(datePicker)).toBe(false);

    app.unmount();
  });

  it('preserves the time segment when datetime-local inputs pick a new date', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref('2026-04-28T09:30');

        return () =>
          h(TextField, {
            label: 'Date time',
            type: 'datetime-local',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as string;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    container.querySelector<HTMLInputElement>('.m3-text-field-input')?.click();
    await nextTick();
    await nextTick();

    getDatePickerButton(container, '2026-04-30')?.click();
    await nextTick();

    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'OK')
      ?.click();
    await nextTick();

    expect(container.querySelector<HTMLInputElement>('.m3-text-field-input')?.value).toBe('2026-04-30T09:30');

    app.unmount();
  });

  it('opens the library TimePicker for time inputs and updates the time value on confirmation', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref('09:30');

        return () =>
          h(TextField, {
            label: 'Time',
            type: 'time',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as string;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-text-field-input');
    const timePicker = document.body.querySelector<HTMLElement>('.m3-time-picker');

    expect(input?.type).toBe('text');

    input?.click();
    await nextTick();
    await nextTick();

    expect(isPopoverOpen(timePicker)).toBe(true);

    const hourInput = document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]');
    const minuteInput = document.body.querySelector<HTMLInputElement>('[data-part="minute-input"]');

    if (hourInput && minuteInput) {
      hourInput.value = '14';
      hourInput.dispatchEvent(new Event('input', { bubbles: true }));
      minuteInput.value = '45';
      minuteInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'OK')
      ?.click();
    await nextTick();

    expect(input?.value).toBe('14:45');
    expect(isPopoverOpen(timePicker)).toBe(false);

    app.unmount();
  });
});
