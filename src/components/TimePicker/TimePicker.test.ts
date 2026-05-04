// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import TimePicker, { type TimePickerModelValue } from './TimePicker.vue';

const popoverOpenElements = new WeakSet<HTMLElement>();

function installPopoverPolyfill() {
  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: (options?: { source?: HTMLElement }) => void;
    hidePopover?: () => void;
    hasPointerCapture?: (pointerId: number) => boolean;
    releasePointerCapture?: (pointerId: number) => void;
    setPointerCapture?: (pointerId: number) => void;
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

function isPopoverOpen(element: HTMLElement | null) {
  return element ? popoverOpenElements.has(element) : false;
}

function getButton(container: HTMLElement, label: string) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
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
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('TimePicker', () => {
  it('renders a standalone popover with the selected time', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        modelValue: '21:30',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const popover = container.querySelector<HTMLElement>('.m3-time-picker');

    expect(isPopoverOpen(popover)).toBe(true);
    expect(container.querySelector('[data-part="hour-display"]')?.textContent?.trim()).toBe('09');
    expect(container.querySelector('[data-part="minute-display"]')?.textContent?.trim()).toBe('30');
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
    expect(container.querySelector('[data-part="hour-display"]')?.textContent?.trim()).toBe('10');
    expect(container.querySelector('[data-part="minute-display"]')?.textContent?.trim()).toBe('45');

    getButton(container, 'OK')?.click();
    await nextTick();

    expect(updates).toEqual(['10:45']);
    expect(isPopoverOpen(container.querySelector<HTMLElement>('.m3-time-picker'))).toBe(false);

    app.unmount();
  });

  it('positions clock options around the clock face', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
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

  it('updates the clock selection from pointer drag and commits on release', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TimePicker, {
        open: true,
        modelValue: '09:30',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const clockFace = container.querySelector<HTMLElement>('[data-part="clock-face"]')!;
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

    expect(container.querySelector('[data-part="hour-display"]')?.textContent?.trim()).toBe('03');
    expect(container.querySelector('[data-part="minute-display"]')?.dataset.selected).toBe('true');

    dispatchPointerEvent(clockFace, 'pointerdown', { button: 0, clientX: 100, clientY: 0 });
    dispatchPointerEvent(clockFace, 'pointermove', { button: 0, clientX: 200, clientY: 100 });
    dispatchPointerEvent(clockFace, 'pointerup', { button: 0, clientX: 200, clientY: 100 });
    await nextTick();

    expect(container.querySelector('[data-part="minute-display"]')?.textContent?.trim()).toBe('15');

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

    expect(container.querySelector<HTMLElement>('.m3-time-picker')?.dataset.inputMode).toBe('keyboard');
    expect(container.querySelector('[data-part="period-selector"]')).toBeNull();

    setInputValue(container.querySelector<HTMLInputElement>('[data-part="hour-input"]'), '7');
    setInputValue(container.querySelector<HTMLInputElement>('[data-part="minute-input"]'), '8');
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
        inputMode: 'keyboard',
        modelValue: '07:00',
      }),
    );

    app.mount(container);
    await nextTick();
    await nextTick();

    const inputRow = container.querySelector('[data-part="inputs"]');
    const periodSelector = inputRow?.querySelector('[data-part="period-selector"]');
    const display = container.querySelector('[data-part="display"]');

    expect(display).toBeNull();
    expect(periodSelector).not.toBeNull();
    expect(inputRow?.querySelector('[data-part="hour-input"]')).not.toBeNull();
    expect(inputRow?.querySelector('[data-part="minute-input"]')).not.toBeNull();
    expect(periodSelector?.querySelectorAll('[data-part="period-option"]')).toHaveLength(2);

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

    setInputValue(container.querySelector<HTMLInputElement>('[data-part="hour-input"]'), '13');
    await nextTick();

    expect(container.querySelector<HTMLInputElement>('[data-part="hour-input"]')?.getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(
      container.querySelector<HTMLInputElement>('[data-part="hour-input"]')?.getAttribute('aria-describedby'),
    ).toBe(container.querySelector('[data-part="input-error"]')?.id);
    expect(container.querySelector('[data-part="input-error"]')?.textContent?.trim()).toBe('Use 1-12');
    expect(getButton(container, 'OK')?.disabled).toBe(true);
    expect(updates).toEqual([]);
    expect(isPopoverOpen(container.querySelector<HTMLElement>('.m3-time-picker'))).toBe(true);

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

    setInputValue(container.querySelector<HTMLInputElement>('[data-part="hour-input"]'), '24');
    setInputValue(container.querySelector<HTMLInputElement>('[data-part="minute-input"]'), '60');
    await nextTick();

    const errors = Array.from(container.querySelectorAll('[data-part="input-error"]'), (error) =>
      error.textContent?.trim(),
    );

    expect(errors).toEqual(['Use 0-23', 'Use 0-59']);
    expect(getButton(container, 'OK')?.disabled).toBe(true);

    app.unmount();
  });
});
