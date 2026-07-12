// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import TextField from './TextField.vue';

const textFieldStyles = readFileSync('src/components/TextField/TextField.css', 'utf8');

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

  it('uses medium size by default and exposes each single-line size across field states', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        h(TextField, { modelValue: '', label: 'Default' }),
        h(TextField, { modelValue: '', label: 'Compact', size: 'extra-small', disabled: true }),
        h(TextField, { modelValue: 'value', label: 'Toolbar', size: 'small', readonly: true }),
        h(TextField, { modelValue: '', label: 'Standard', size: 'medium', error: 'Invalid' }),
      ]),
    );

    app.mount(container);
    await nextTick();

    const fields = Array.from(container.querySelectorAll<HTMLElement>('.m3-text-field'));

    expect(fields.map((field) => field.dataset.size)).toEqual(['medium', 'extra-small', 'small', 'medium']);
    expect(fields[1]?.dataset.disabled).toBe('true');
    expect(fields[2]?.dataset.populated).toBe('true');
    expect(fields[2]?.querySelector('input')?.readOnly).toBe(true);
    expect(fields[3]?.dataset.invalid).toBe('true');

    app.unmount();
  });

  it('keeps leading and trailing slot wrappers compact at every single-line size', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        'div',
        (['extra-small', 'small', 'medium'] as const).map((size) =>
          h(
            TextField,
            { modelValue: '', size, 'aria-label': `${size} search` },
            {
              leading: () => h('span', { class: 'm3-icon' }, 'search'),
              trailing: () => h('span', { class: 'm3-icon' }, 'close'),
            },
          ),
        ),
      ),
    );

    app.mount(container);
    await nextTick();

    const fields = Array.from(container.querySelectorAll<HTMLElement>('.m3-text-field'));
    const adornmentRule = textFieldStyles.match(
      /\.m3-text-field-leading-slot,\s*\.m3-text-field-trailing-slot\s*\{([^}]*)\}/,
    )?.[1];
    expect(fields.map((field) => field.dataset.size)).toEqual(['extra-small', 'small', 'medium']);
    expect(fields.every((field) => field.querySelector('.m3-text-field-leading-slot .m3-icon'))).toBe(true);
    expect(fields.every((field) => field.querySelector('.m3-text-field-trailing-slot .m3-icon'))).toBe(true);
    expect(adornmentRule).toContain('display: inline-flex');
    expect(adornmentRule).toContain('align-items: center');
    expect(adornmentRule).toContain('line-height: 1');

    app.unmount();
  });

  it('keeps prefix and suffix typography within every single-line size contract', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        'div',
        (['extra-small', 'small', 'medium'] as const).map((size) =>
          h(
            TextField,
            { modelValue: '12', size, 'aria-label': `${size} amount` },
            {
              prefix: () => '$',
              suffix: () => 'USD',
            },
          ),
        ),
      ),
    );

    app.mount(container);
    await nextTick();

    const fields = Array.from(container.querySelectorAll<HTMLElement>('.m3-text-field'));
    const affixRule = textFieldStyles.match(
      /\.m3-text-field-prefix-slot,\s*\.m3-text-field-suffix-slot\s*\{([^}]*)\}/,
    )?.[1];

    expect(fields.map((field) => field.dataset.size)).toEqual(['extra-small', 'small', 'medium']);
    expect(fields.every((field) => field.querySelector('.m3-text-field-prefix-slot')?.textContent === '$')).toBe(true);
    expect(fields.every((field) => field.querySelector('.m3-text-field-suffix-slot')?.textContent === 'USD')).toBe(
      true,
    );
    expect(affixRule).toContain('display: inline-flex');
    expect(affixRule).toContain('align-items: center');
    expect(affixRule).toContain('font-size: var(--_outlined-text-field-input-text-size)');
    expect(affixRule).toContain('line-height: var(--_outlined-text-field-input-text-line-height)');
    expect(textFieldStyles).toMatch(
      /\.m3-text-field-suffix-slot\s*\{\s*color: var\(--_outlined-text-field-input-text-suffix-color\)/,
    );

    app.unmount();
  });

  it('integrates direct slot IconButtons without changing the field size contract', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        'div',
        (['extra-small', 'small', 'medium'] as const).map((size) =>
          h(
            TextField,
            { modelValue: '', size, 'aria-label': `${size} search` },
            {
              leading: () => h(IconButton, { icon: 'search', color: 'standard', 'aria-label': 'Search' }),
              trailing: () => h(IconButton, { icon: 'close', color: 'standard', 'aria-label': 'Clear' }),
            },
          ),
        ),
      ),
    );

    app.mount(container);
    await nextTick();

    const fields = Array.from(container.querySelectorAll<HTMLElement>('.m3-text-field'));
    const actionRule = textFieldStyles.match(
      /\.m3-text-field-leading-slot > \.m3-icon-button,\s*\.m3-text-field-trailing-slot > \.m3-icon-button\s*\{([^}]*)\}/,
    )?.[1];
    const leadingIconButtonRule = textFieldStyles.match(
      /\.m3-text-field-leading-slot > \.m3-icon-button\s*\{([^}]*)\}/,
    )?.[1];
    const trailingIconButtonRule = Array.from(
      textFieldStyles.matchAll(/\.m3-text-field-trailing-slot > \.m3-icon-button\s*\{([^}]*)\}/g),
    ).at(-1)?.[1];
    const leadingEdgeRule = textFieldStyles.match(
      /\.m3-text-field-leading-slot > \.m3-icon-button:first-child\s*\{([^}]*)\}/,
    )?.[1];
    const trailingEdgeRule = textFieldStyles.match(
      /\.m3-text-field-trailing-slot > \.m3-icon-button:last-child\s*\{([^}]*)\}/,
    )?.[1];

    expect(fields.map((field) => field.dataset.size)).toEqual(['extra-small', 'small', 'medium']);
    expect(fields.every((field) => field.querySelector('.m3-text-field-leading-slot > .m3-icon-button'))).toBe(true);
    expect(fields.every((field) => field.querySelector('.m3-text-field-trailing-slot > .m3-icon-button'))).toBe(true);
    expect(
      fields.every((field) => field.querySelector('.m3-text-field-leading-slot > .m3-icon-button:first-child')),
    ).toBe(true);
    expect(
      fields.every((field) => field.querySelector('.m3-text-field-trailing-slot > .m3-icon-button:last-child')),
    ).toBe(true);
    expect(actionRule).toContain('margin-block: var(--_slot-action-margin)');
    expect(actionRule).toContain('--md-icon-button-container-height: var(--_slot-action-height)');
    expect(actionRule).toContain('--md-icon-button-default-leading-space: var(--_slot-action-space)');
    expect(actionRule).toContain('--md-icon-button-default-trailing-space: var(--_slot-action-space)');
    expect(leadingIconButtonRule).toContain(
      '--md-icon-button-icon-size: var(--_outlined-text-field-leading-icon-size)',
    );
    expect(trailingIconButtonRule).toContain(
      '--md-icon-button-icon-size: var(--_outlined-text-field-trailing-icon-size)',
    );
    expect(leadingEdgeRule).toContain('margin-inline-start: var(--_slot-action-margin)');
    expect(trailingEdgeRule).toContain('margin-inline-end: var(--_slot-action-margin)');

    app.unmount();
  });

  it('keeps multiline fields at medium size', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        as: 'textarea',
        // Exercise the runtime safeguard for untyped consumers.
        size: 'extra-small' as 'medium',
        rows: 4,
        modelValue: 'Multiline value',
      }),
    );

    app.mount(container);
    await nextTick();

    const field = container.querySelector<HTMLElement>('.m3-text-field');

    expect(field?.dataset.size).toBe('medium');
    expect(field?.dataset.multiline).toBe('true');
    expect(field?.querySelector('textarea')?.rows).toBe(4);

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

  it('uses the field container as the picker anchor', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Date',
        type: 'date',
        modelValue: '2026-04-28',
      }),
    );

    app.mount(container);
    await nextTick();

    const textFieldContainer = container.querySelector<HTMLElement>('.m3-text-field-container');

    expect(textFieldContainer?.style.getPropertyValue('anchor-name')).toContain('--m3-text-field-date-picker-anchor-');

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
