// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { createApp, h, nextTick, provide, ref } from 'vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import { fieldContextKey } from './FieldContext';
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

  it('does not add inline label clearance by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(
      container.querySelector<HTMLElement>('[data-scope="text-field"][data-part="root"]')?.style.marginBlockStart,
    ).toBe('');

    app.unmount();
  });

  it('uses context label clearance and lets the component prop override it', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const contextLabelClearance = ref('0.5rem');

    const app = createApp({
      setup() {
        provide(fieldContextKey, {
          labelClearance: contextLabelClearance,
        });

        return () =>
          h('div', [
            h(TextField, {
              modelValue: '',
            }),
            h(TextField, {
              modelValue: '',
              labelClearance: '0.75rem',
            }),
          ]);
      },
    });

    app.mount(container);
    await nextTick();

    const fields = Array.from(container.querySelectorAll<HTMLElement>('[data-scope="text-field"][data-part="root"]'));

    expect(fields.map((field) => field.style.marginBlockStart)).toEqual(['0.5rem', '0.75rem']);

    contextLabelClearance.value = '1rem';
    await nextTick();

    expect(fields.map((field) => field.style.marginBlockStart)).toEqual(['1rem', '0.75rem']);

    app.unmount();
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

  it('keeps the public model and update event typed as strings', () => {
    type Props = InstanceType<typeof TextField>['$props'];
    type UpdateModelValue = NonNullable<Props['onUpdate:modelValue']>;

    expectTypeOf<Props['modelValue']>().toEqualTypeOf<string>();
    expectTypeOf<Parameters<UpdateModelValue>>().toEqualTypeOf<[value: string]>();
  });

  it('emits the native string value for number inputs across empty, zero, and decimal values', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const updates: unknown[] = [];

    const app = createApp({
      setup() {
        const value = ref('');

        return () =>
          h(TextField, {
            label: 'Amount',
            type: 'number',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              updates.push(nextValue);
              value.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-text-field-input');

    for (const nextValue of ['0', '12.50', '']) {
      if (input) {
        input.value = nextValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      await nextTick();
    }

    expect(updates).toEqual(['0', '12.50', '']);
    expect(updates.every((value) => typeof value === 'string')).toBe(true);

    app.unmount();
  });

  it('keeps the floating-label population state in sync with number input', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref('');

        return () =>
          h(TextField, {
            label: 'Amount',
            type: 'number',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const field = container.querySelector<HTMLElement>('.m3-text-field');
    const input = container.querySelector<HTMLInputElement>('.m3-text-field-input');

    expect(field?.dataset.populated).toBe('false');

    if (input) {
      input.value = '0';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await nextTick();

    expect(field?.dataset.populated).toBe('true');

    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await nextTick();

    expect(field?.dataset.populated).toBe('false');

    app.unmount();
  });

  it.each([
    ['text input', {}],
    ['textarea', { as: 'textarea' as const }],
  ])('preserves string model updates for a regular %s', async (_name, fieldProps) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const updates: unknown[] = [];
    const inputEvents: Event[] = [];

    const app = createApp({
      setup() {
        const value = ref('');

        return () =>
          h(TextField, {
            ...fieldProps,
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              updates.push(nextValue);
              value.value = nextValue;
            },
            onInput: (event) => {
              inputEvents.push(event);
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const control = container.querySelector<HTMLInputElement | HTMLTextAreaElement>('.m3-text-field-input');

    if (control) {
      control.value = 'Updated value';
      control.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await nextTick();

    expect(updates).toEqual(['Updated value']);
    expect(control?.value).toBe('Updated value');
    expect(inputEvents).toHaveLength(1);
    expect(inputEvents[0]?.target).toBe(control);

    app.unmount();
  });

  it('waits for text composition to finish before updating the model', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const updates: string[] = [];

    const app = createApp({
      setup() {
        const value = ref('');

        return () =>
          h(TextField, {
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              updates.push(nextValue);
              value.value = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-text-field-input');

    input?.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    if (input) {
      input.value = '拼';
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: '拼', isComposing: true }));
    }
    await nextTick();

    expect(updates).toEqual([]);

    input?.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await nextTick();

    expect(updates).toEqual(['拼']);

    app.unmount();
  });

  it('falls back to the error text when no supporting slot is provided', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        error: 'Amount is required',
        supportingText: 'Helper text',
        modelValue: '',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector('.m3-text-field-supporting')?.textContent?.trim()).toBe('Amount is required');

    app.unmount();
  });

  it('renders supporting text when error is an empty string', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(TextField, {
        label: 'Amount',
        error: '',
        supportingText: 'Helper text',
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

  it('clips the collapsed outline legend to a single line while retaining the animated notch', () => {
    const legendRule = textFieldStyles.match(/\.m3-text-field-outline legend\s*\{([^}]*)\}/)?.[1];
    const expandedLegendRule = textFieldStyles.match(
      /\.m3-text-field:focus-within \.m3-text-field-outline legend,[\s\S]*?\.m3-text-field\[data-always-float-label='true'\] \.m3-text-field-outline legend\s*\{([^}]*)\}/,
    )?.[1];

    expect(legendRule).toContain('overflow: clip');
    expect(legendRule).toContain('white-space: nowrap');
    expect(legendRule).toContain('max-inline-size: 0.01px');
    expect(expandedLegendRule).toContain('max-inline-size: 100%');
    expect(expandedLegendRule).toContain('padding-inline: 0.25rem');
  });

  it('uses the native fieldset border for continuous rounded corners and the floating-label notch', () => {
    const outlineRule = textFieldStyles.match(/\.m3-text-field-outline\s*\{([^}]*)\}/)?.[1];
    expect(outlineRule).toContain('border: var(--_outline-width) solid var(--_outline-color)');
    expect(outlineRule).toContain('border-radius: inherit');
    expect(outlineRule).not.toContain('box-shadow');
    expect(textFieldStyles).not.toContain('.m3-text-field-outline::before');
    expect(textFieldStyles).not.toContain('--md-outlined-text-field-container-color');
    expect(textFieldStyles).toContain('@media (forced-colors: active)');
    expect(textFieldStyles).toContain('border: var(--_outline-width) solid CanvasText');
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

  it('maps square shape and resting outline defaults to the same-sized outlined Button tokens', () => {
    const extraSmallRule = textFieldStyles.match(
      /\.m3-text-field\[data-size='extra-small'\]\s*\{([\s\S]*?)\n  \}/,
    )?.[1];
    const smallRule = textFieldStyles.match(/\.m3-text-field\[data-size='small'\]\s*\{([\s\S]*?)\n  \}/)?.[1];
    const mediumRule = textFieldStyles.match(/\.m3-text-field\[data-size='medium'\]\s*\{([\s\S]*?)\n  \}/)?.[1];

    expect(extraSmallRule).toContain('--md-button-xsmall-container-shape-square');
    expect(extraSmallRule).toContain('--md-control-outline-width-extra-small');
    expect(smallRule).toContain('--md-button-small-container-shape-square');
    expect(smallRule).toContain('--md-control-outline-width-small');
    expect(mediumRule).toContain('--md-button-medium-container-shape-square');
    expect(mediumRule).toContain('--md-control-outline-width-medium');
    expect(textFieldStyles).toContain('var(--md-button-outlined-outline-color, var(--md-control-outline-color))');
  });

  it('aligns the floating label and legend notch from each size container padding', () => {
    const rootRule = textFieldStyles.match(/\.m3-text-field\s*\{([\s\S]*?)\n  \}/)?.[1];
    const outlineRule = textFieldStyles.match(/\.m3-text-field-outline\s*\{([^}]*)\}/)?.[1];

    expect(rootRule).toContain('calc(var(--_floating-label-inline-start) - 0.25rem - var(--_outline-width))');
    expect(outlineRule).toContain('padding-inline: var(--_outline-horizontal-padding)');
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
              leading: () => h(IconButton, { icon: 'search', 'aria-label': 'Search' }),
              trailing: () => h(IconButton, { icon: 'close', 'aria-label': 'Clear' }),
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
    expect(actionRule).toContain('margin-block: var(--_slot-action-margin-block)');
    expect(actionRule).toContain('--md-icon-button-container-height: var(--_slot-action-height)');
    expect(actionRule).toContain('--md-icon-button-default-leading-space: var(--_slot-action-space)');
    expect(actionRule).toContain('--md-icon-button-default-trailing-space: var(--_slot-action-space)');
    expect(leadingIconButtonRule).toContain(
      '--md-icon-button-icon-size: var(--_outlined-text-field-leading-icon-size)',
    );
    expect(trailingIconButtonRule).toContain(
      '--md-icon-button-icon-size: var(--_outlined-text-field-trailing-icon-size)',
    );
    expect(leadingEdgeRule).toContain('margin-inline-start: calc(-1 * var(--_slot-action-space))');
    expect(trailingEdgeRule).toContain('margin-inline-end: calc(-1 * var(--_slot-action-space))');

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
