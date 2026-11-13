// @vitest-environment jsdom
import { installPopoverPolyfill, isPopoverOpen } from '../../../tests/unit/popover';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import TimePicker, { type TimePickerModelValue } from './TimePicker.vue';

function installPointerCapturePolyfill() {
  const prototype = HTMLElement.prototype;

  if (typeof prototype.setPointerCapture !== 'function') {
    Object.defineProperty(prototype, 'setPointerCapture', {
      configurable: true,
      value() {},
    });
  }

  if (typeof prototype.releasePointerCapture !== 'function') {
    Object.defineProperty(prototype, 'releasePointerCapture', {
      configurable: true,
      value() {},
    });
  }

  if (typeof prototype.hasPointerCapture !== 'function') {
    Object.defineProperty(prototype, 'hasPointerCapture', {
      configurable: true,
      value() {
        return true;
      },
    });
  }
}

function getButton(_container: HTMLElement, label: string) {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => button.textContent?.trim() === label,
  );
}

function setInputValue(input: HTMLInputElement | null, value: string) {
  if (!input) {
    return;
  }

  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function dispatchPointerEvent(element: Element, type: string, options: MouseEventInit & { pointerId?: number }) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });

  Object.defineProperty(event, 'pointerId', {
    configurable: true,
    value: options.pointerId ?? 1,
  });

  element.dispatchEvent(event);
}

beforeAll(() => {
  installPopoverPolyfill();
  installPointerCapturePolyfill();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('TimePicker', () => {
  it('opens the latest closed model through the component API and closes through hide', async () => {
    const value = ref('12:30');
    const open = ref(false);
    const picker = ref<InstanceType<typeof TimePicker>>();
    const host = document.createElement('div');
    document.body.appendChild(host);
    const app = createApp(() =>
      h(TimePicker, {
        ref: picker,
        modelValue: value.value,
        open: open.value,
        'onUpdate:open': (next) => {
          open.value = next;
        },
        locale: 'en-US',
        format: '24h',
        inputMode: 'clock',
      }),
    );
    app.mount(host);
    await nextTick();
    value.value = '09:45';
    await nextTick();
    picker.value!.show();
    await nextTick();
    await nextTick();
    const root = document.querySelector<HTMLElement>('[data-scope="time-picker"][data-part="root"]')!;
    expect(open.value).toBe(true);
    expect(root.matches(':popover-open')).toBe(true);
    expect(root.querySelector('[data-part="hour-display"]')?.textContent?.trim()).toBe('09');
    expect(root.querySelector('[data-part="minute-display"]')?.textContent?.trim()).toBe('45');
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
      h(TimePicker, {
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

    document.body.querySelector<HTMLElement>('.m3-time-picker')?.hidePopover();
    await nextTick();
    await Promise.resolve();

    expect(open.value).toBe(false);
    expect(onClosed).toHaveBeenCalledOnce();
    app.unmount();
  });

  it('uses the locale hour cycle and day-period labels by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const locale = ref('en-GB');
    const format = ref<'12h' | undefined>();
    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        modelValue: '09:30',
        locale: locale.value,
        format: format.value,
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    expect(document.body.querySelector('[data-part="period-selector"]')).toBeNull();
    expect(document.body.querySelector('[data-part="hour-input"]')).not.toBeNull();

    locale.value = 'zh-CN';
    format.value = '12h';
    await nextTick();

    const periods = Array.from(document.body.querySelectorAll<HTMLElement>('[data-part="period-option"]')).map(
      (option) => option.textContent?.trim(),
    );
    expect(periods).toEqual(['上午', '下午']);

    app.unmount();
  });

  it('renders a standalone popover with the selected time', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        locale: 'en-US',
        modelValue: '21:30',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const popover = document.body.querySelector<HTMLElement>('.m3-time-picker');

    expect(isPopoverOpen(popover)).toBe(true);
    expect(popover?.parentElement).toBe(container);
    expect(document.body.querySelector('[data-part="hour-display"]')?.textContent?.trim()).toBe('09');
    expect(document.body.querySelector('[data-part="minute-display"]')?.textContent?.trim()).toBe('30');
    expect(getButton(container, 'PM')?.dataset.selected).toBe('true');

    app.unmount();
  });

  it('keeps clock selection as a draft until confirmed', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: TimePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<TimePickerModelValue>('09:30');

        return () =>
          h(TimePicker, {
            open: true,
            format: '12h',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as TimePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    getButton(container, '10')?.click();
    await nextTick();
    getButton(container, '45')?.click();
    await nextTick();

    expect(updates).toEqual([]);
    expect(document.body.querySelector('[data-part="hour-display"]')?.textContent?.trim()).toBe('10');
    expect(document.body.querySelector('[data-part="minute-display"]')?.textContent?.trim()).toBe('45');

    getButton(container, 'OK')?.click();
    await nextTick();

    expect(updates).toEqual(['10:45']);
    expect(isPopoverOpen(document.body.querySelector<HTMLElement>('.m3-time-picker'))).toBe(false);

    app.unmount();
  });

  it('positions clock options around the clock face', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        format: '12h',
        modelValue: '09:30',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const option12 = getButton(container, '12');
    const option3 = getButton(container, '3');
    const option6 = getButton(container, '6');

    expect(option12?.style.insetInlineStart).toBe('50%');
    expect(option12?.style.insetBlockStart).toBe('10%');
    expect(option3?.style.insetInlineStart).toBe('90%');
    expect(option3?.style.insetBlockStart).toBe('50%');
    expect(option6?.style.insetInlineStart).toBe('50%');
    expect(option6?.style.insetBlockStart).toBe('90%');

    app.unmount();
  });

  it('preserves exact minutes when dragging between clock marks', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: TimePickerModelValue[] = [];
    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        format: '12h',
        modelValue: '09:30',
        'onUpdate:modelValue': (value) => updates.push(value),
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const clockFace = document.body.querySelector<HTMLElement>('[data-part="clock-face"]')!;
    Object.defineProperty(clockFace, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        width: 200,
        height: 200,
        right: 200,
        bottom: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    dispatchPointerEvent(clockFace, 'pointerdown', { button: 0, clientX: 100, clientY: 0 });
    dispatchPointerEvent(clockFace, 'pointermove', { button: 0, clientX: 200, clientY: 100 });
    dispatchPointerEvent(clockFace, 'pointerup', { button: 0, clientX: 200, clientY: 100 });
    await nextTick();

    expect(document.body.querySelector('[data-part="hour-display"]')?.textContent?.trim()).toBe('03');
    expect(document.body.querySelector<HTMLElement>('[data-part="minute-display"]')?.dataset.selected).toBe('true');

    const minutePosition = (minute: number) => {
      const angle = (minute * Math.PI) / 30;
      return { button: 0, clientX: 100 + 100 * Math.sin(angle), clientY: 100 - 100 * Math.cos(angle) };
    };
    const minuteDisplay = document.body.querySelector('[data-part="minute-display"]');
    const selectedClockOption = () => clockFace.querySelector('[aria-pressed="true"]')?.textContent?.trim();

    dispatchPointerEvent(clockFace, 'pointerdown', minutePosition(0));
    dispatchPointerEvent(clockFace, 'pointermove', minutePosition(13));
    await nextTick();

    expect(minuteDisplay?.textContent?.trim()).toBe('13');
    expect(selectedClockOption()).toBe('15');

    dispatchPointerEvent(clockFace, 'pointermove', minutePosition(14));
    dispatchPointerEvent(clockFace, 'pointerup', minutePosition(14));
    await nextTick();

    expect(minuteDisplay?.textContent?.trim()).toBe('14');
    expect(selectedClockOption()).toBe('15');

    getButton(container, 'OK')?.click();
    expect(updates).toEqual(['03:14']);

    app.unmount();
  });

  it('starts 24h format in keyboard mode and commits typed input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: TimePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<TimePickerModelValue>('18:05');

        return () =>
          h(TimePicker, {
            open: true,
            format: '24h',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as TimePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    expect(document.body.querySelector<HTMLElement>('.m3-time-picker')?.dataset.inputMode).toBe('keyboard');
    expect(document.body.querySelector('[data-part="period-selector"]')).toBeNull();

    setInputValue(document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]'), '7');
    setInputValue(document.body.querySelector<HTMLInputElement>('[data-part="minute-input"]'), '8');
    getButton(container, 'OK')?.click();
    await nextTick();

    expect(updates).toEqual(['07:08']);

    app.unmount();
  });

  it('renders keyboard mode with inputs and period selector in the input row', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        format: '12h',
        inputMode: 'keyboard',
        modelValue: '07:00',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const inputRow = document.body.querySelector('[data-part="inputs"]');
    const periodSelector = inputRow?.querySelector('[data-part="period-selector"]');
    const display = document.body.querySelector('[data-part="display"]');

    expect(display).toBeNull();
    expect(periodSelector).not.toBeNull();
    expect(inputRow?.querySelector('[data-part="hour-input"]')).not.toBeNull();
    expect(inputRow?.querySelector('[data-part="minute-input"]')).not.toBeNull();
    expect(periodSelector?.querySelectorAll('[data-part="period-option"]')).toHaveLength(2);

    app.unmount();
  });

  it('moves focus to minute input after typing two hour digits', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        inputMode: 'keyboard',
        modelValue: '07:00',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const hourInput = document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]');
    const minuteInput = document.body.querySelector<HTMLInputElement>('[data-part="minute-input"]');

    hourInput?.focus();
    setInputValue(hourInput, '08');
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(minuteInput);

    app.unmount();
  });

  it('moves focus to minute input when pressing Enter in the hour input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        inputMode: 'keyboard',
        modelValue: '07:00',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const hourInput = document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]');
    const minuteInput = document.body.querySelector<HTMLInputElement>('[data-part="minute-input"]');

    hourInput?.focus();
    hourInput?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(minuteInput);

    app.unmount();
  });

  it('confirms keyboard input when pressing Enter in the minute input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: TimePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<TimePickerModelValue>('08:15');

        return () =>
          h(TimePicker, {
            open: true,
            inputMode: 'keyboard',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as TimePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    const hourInput = document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]');
    const minuteInput = document.body.querySelector<HTMLInputElement>('[data-part="minute-input"]');

    setInputValue(hourInput, '09');
    setInputValue(minuteInput, '45');
    minuteInput?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await nextTick();

    expect(updates).toEqual(['09:45']);
    expect(isPopoverOpen(document.body.querySelector<HTMLElement>('.m3-time-picker'))).toBe(false);

    app.unmount();
  });

  it('does not confirm invalid keyboard input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: TimePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<TimePickerModelValue>('08:15');

        return () =>
          h(TimePicker, {
            open: true,
            format: '12h',
            inputMode: 'keyboard',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as TimePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    setInputValue(document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]'), '13');
    await nextTick();

    expect(
      document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]')?.getAttribute('aria-invalid'),
    ).toBe('true');
    expect(
      document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]')?.getAttribute('aria-describedby'),
    ).toBe(document.body.querySelector('[data-part="input-error"]')?.id);
    expect(document.body.querySelector('[data-part="input-error"]')?.textContent?.trim()).toBe('Use 1-12');
    expect(getButton(container, 'OK')?.disabled).toBe(true);
    expect(updates).toEqual([]);
    expect(isPopoverOpen(document.body.querySelector<HTMLElement>('.m3-time-picker'))).toBe(true);

    app.unmount();
  });

  it('keeps the picker open when pressing Enter with invalid minute input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: TimePickerModelValue[] = [];
    const app = createApp({
      setup() {
        const value = ref<TimePickerModelValue>('08:15');

        return () =>
          h(TimePicker, {
            open: true,
            inputMode: 'keyboard',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as TimePickerModelValue;
              updates.push(value.value);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();
    await nextTick();

    setInputValue(document.body.querySelector<HTMLInputElement>('[data-part="minute-input"]'), '60');
    document.body
      .querySelector<HTMLInputElement>('[data-part="minute-input"]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await nextTick();

    expect(updates).toEqual([]);
    expect(document.body.querySelector('[data-part="input-error"]')?.textContent?.trim()).toBe('Use 0-59');
    expect(isPopoverOpen(document.body.querySelector<HTMLElement>('.m3-time-picker'))).toBe(true);

    app.unmount();
  });

  it('validates 24h keyboard hour and minute ranges independently', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        format: '24h',
        modelValue: '08:15',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    setInputValue(document.body.querySelector<HTMLInputElement>('[data-part="hour-input"]'), '24');
    setInputValue(document.body.querySelector<HTMLInputElement>('[data-part="minute-input"]'), '60');
    await nextTick();

    const errors = Array.from(document.body.querySelectorAll('[data-part="input-error"]'), (error) =>
      error.textContent?.trim(),
    );

    expect(errors).toEqual(['Use 0-23', 'Use 0-59']);
    expect(getButton(container, 'OK')?.disabled).toBe(true);

    app.unmount();
  });
});
