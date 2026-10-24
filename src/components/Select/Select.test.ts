// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, provide, ref } from 'vue';
import { M3VuePlugin } from '@/plugin';
import { selectContextKey, provideSelectDefaults } from './SelectContext';
import SelectItem from './SelectItem.vue';
import { fieldContextKey } from '@/components/TextField/FieldContext';
import Select, { type SelectModelValue, type SelectOption } from './Select.vue';

const options: SelectOption[] = [
  {
    label: 'Espresso',
    value: 'espresso',
    leadingIcon: 'local_cafe',
    supportingText: 'Strong and concentrated',
  },
  {
    label: 'Pour-over',
    value: 'pour-over',
    leadingIcon: 'coffee_maker',
  },
  {
    label: 'Cold brew',
    value: 'cold-brew',
    trailingText: 'Seasonal',
  },
];

const optionsWithoutIcons: SelectOption[] = [
  {
    label: 'Espresso',
    value: 'espresso',
    supportingText: 'Strong and concentrated',
  },
  {
    label: 'Pour-over',
    value: 'pour-over',
  },
  {
    label: 'Cold brew',
    value: 'cold-brew',
    trailingText: 'Seasonal',
  },
];

const stateOptions: SelectOption[] = [
  { label: 'Alabama', value: 'alabama' },
  { label: 'Alaska', value: 'alaska' },
  { label: 'Arizona', value: 'arizona' },
  { label: 'Arkansas', value: 'arkansas' },
  { label: 'California', value: 'california' },
  { label: 'Colorado', value: 'colorado' },
  { label: 'Connecticut', value: 'connecticut' },
];

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

function getCurrentOptions(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'));
}

function getSelectInput(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>('.m3-select-field .m3-text-field-input');
}

function createMousePointerEvent(type: string, clientX: number, clientY: number) {
  const EventConstructor = window.PointerEvent ?? MouseEvent;
  const event = new EventConstructor(type, { bubbles: true, clientX, clientY });
  Object.defineProperties(event, {
    pointerType: { value: 'mouse' },
    pointerId: { value: 1 },
    isPrimary: { value: true },
  });
  return event;
}

describe('Select', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('applies context or prop label clearance only to the public Select root', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const contextLabelClearance = ref('0.25rem');

    const app = createApp({
      setup() {
        provide(fieldContextKey, {
          labelClearance: contextLabelClearance,
        });

        return () =>
          h('div', [
            h(Select, {
              label: 'Coffee',
              options,
            }),
            h(Select, {
              label: 'Coffee',
              options,
              labelClearance: '0.5rem',
            }),
          ]);
      },
    });

    app.mount(container);
    await nextTick();

    const selects = Array.from(container.querySelectorAll<HTMLElement>('.m3-select'));
    const innerFields = Array.from(container.querySelectorAll<HTMLElement>('.m3-select-field'));

    expect(selects.map((select) => select.style.marginBlockStart)).toEqual(['0.25rem', '0.5rem']);
    expect(innerFields.map((field) => field.style.marginBlockStart)).toEqual(['0rem', '0rem']);

    contextLabelClearance.value = '0.75rem';
    await nextTick();

    expect(selects.map((select) => select.style.marginBlockStart)).toEqual(['0.75rem', '0.5rem']);

    app.unmount();
  });

  it('uses medium size by default and forwards every size to its TextField', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', [
        h(Select, { options, modelValue: undefined }),
        h(Select, { options, modelValue: 'espresso', size: 'extra-small', clearable: true }),
        h(Select, { options, modelValue: undefined, size: 'small', filterable: true, disabled: true }),
        h(Select, { options, modelValue: undefined, size: 'medium', error: 'Required' }),
      ]),
    );

    app.mount(container);
    await nextTick();

    const selects = Array.from(container.querySelectorAll<HTMLElement>('.m3-select'));

    expect(selects.map((select) => select.dataset.size)).toEqual(['medium', 'extra-small', 'small', 'medium']);
    expect(selects.map((select) => select.querySelector<HTMLElement>('.m3-select-field')?.dataset.size)).toEqual([
      'medium',
      'extra-small',
      'small',
      'medium',
    ]);
    expect(selects[1]?.querySelector('.m3-select-clear-button')).not.toBeNull();
    expect(selects[2]?.dataset.filterable).toBe('true');
    expect(selects[2]?.querySelector('input')?.disabled).toBe(true);
    expect(selects[3]?.dataset.invalid).toBe('true');

    app.unmount();
  });

  it('renders the selected label and updates a single value on selection', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    let selectedValue = '';

    const app = createApp({
      setup() {
        const value = ref<string | undefined>();

        return () =>
          h(Select, {
            label: 'Coffee',
            options,
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as string | undefined;
              selectedValue = value.value ?? '';
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const menu = container.querySelector<HTMLElement>('[role="listbox"]');
    const menuItems = container.querySelectorAll<HTMLButtonElement>('[role="option"]');

    expect(getSelectInput(container)?.value).toBe('');

    menuItems[1]?.click();
    await nextTick();

    expect(selectedValue).toBe('pour-over');
    expect(getSelectInput(container)?.value).toBe('Pour-over');
    expect(isPopoverOpen(menu)).toBe(false);

    app.unmount();
  });

  it('selects an option when a mouse press on the field drags onto it', async () => {
    installPopoverPolyfill();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const value = ref<SelectModelValue>();
    const app = createApp(() =>
      h(Select, {
        label: 'Coffee',
        options,
        modelValue: value.value,
        'onUpdate:modelValue': (nextValue) => {
          value.value = nextValue as SelectModelValue;
        },
      }),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    const menu = container.querySelector<HTMLElement>('[role="listbox"]');
    const items = getCurrentOptions(container);

    trigger?.dispatchEvent(createMousePointerEvent('pointerdown', 10, 10));
    document.dispatchEvent(createMousePointerEvent('pointermove', 20, 20));
    await nextTick();
    expect(isPopoverOpen(menu)).toBe(true);
    items[1]?.dispatchEvent(createMousePointerEvent('pointerup', 30, 30));
    await nextTick();

    expect(value.value).toBe('pour-over');
    expect(isPopoverOpen(menu)).toBe(false);

    trigger?.dispatchEvent(createMousePointerEvent('pointerdown', 10, 10));
    document.dispatchEvent(createMousePointerEvent('pointermove', 20, 20));
    document.body.dispatchEvent(createMousePointerEvent('pointerup', 30, 30));
    await nextTick();
    expect(isPopoverOpen(menu)).toBe(false);
    expect(value.value).toBe('pour-over');

    app.unmount();
  });

  it('keeps the menu open for multiple selection and toggles values', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    let selectedValues: string[] = ['espresso'];

    const app = createApp({
      setup() {
        const value = ref<string[]>(['espresso']);

        return () =>
          h(Select, {
            label: 'Coffee',
            options,
            multiple: true,
            open: true,
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = [...(nextValue as string[])];
              selectedValues = [...value.value];
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const menu = container.querySelector<HTMLElement>('[role="listbox"]');
    const menuItems = container.querySelectorAll<HTMLButtonElement>('[role="option"]');

    expect(isPopoverOpen(menu)).toBe(true);

    menuItems[1]?.click();
    await nextTick();

    expect(selectedValues).toEqual(['espresso', 'pour-over']);
    expect(isPopoverOpen(menu)).toBe(true);
    expect(getSelectInput(container)?.value).toBe('Espresso, Pour-over');

    menuItems[0]?.click();
    await nextTick();

    expect(selectedValues).toEqual(['pour-over']);
    expect(isPopoverOpen(menu)).toBe(true);

    app.unmount();
  });

  it('renders hidden inputs for form submission', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        label: 'Coffee',
        name: 'coffee',
        options,
        multiple: true,
        modelValue: ['espresso', 'cold-brew'],
      }),
    );

    app.mount(container);
    await nextTick();

    const hiddenInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="hidden"]'));

    expect(hiddenInputs.map((input) => input.name)).toEqual(['coffee', 'coffee']);
    expect(hiddenInputs.map((input) => input.value)).toEqual(['espresso', 'cold-brew']);

    app.unmount();
  });

  it('clears a single selection from the trailing clear button', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    let selectedValue: SelectModelValue = 'espresso';
    let changedValue: SelectModelValue | 'unchanged' = 'unchanged';

    const app = createApp({
      setup() {
        const value = ref<SelectModelValue>('espresso');

        return () =>
          h(Select, {
            label: 'Coffee',
            options,
            clearable: true,
            clearLabel: 'Clear coffee',
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as SelectModelValue;
              selectedValue = value.value;
            },
            onChange: (nextValue) => {
              changedValue = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const menu = container.querySelector<HTMLElement>('[role="listbox"]');
    const clearButton = container.querySelector<HTMLButtonElement>('[data-part="clear-button"]');

    expect(clearButton?.getAttribute('aria-label')).toBe('Clear coffee');

    clearButton?.click();
    await nextTick();

    expect(selectedValue).toBeUndefined();
    expect(changedValue).toBeUndefined();
    expect(getSelectInput(container)?.value).toBe('');
    expect(container.querySelector('[data-part="clear-button"]')).toBeNull();
    expect(isPopoverOpen(menu)).toBe(false);

    app.unmount();
  });

  it('clears a multiple selection to an empty array from the trailing clear button', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    let selectedValues: SelectOption['value'][] = ['espresso', 'cold-brew'];
    let changedValue: SelectModelValue | 'unchanged' = 'unchanged';

    const app = createApp({
      setup() {
        const value = ref<SelectOption['value'][]>(['espresso', 'cold-brew']);

        return () =>
          h(Select, {
            label: 'Coffee',
            name: 'coffee',
            options,
            multiple: true,
            clearable: true,
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = [...(nextValue as SelectOption['value'][])];
              selectedValues = [...value.value];
            },
            onChange: (nextValue) => {
              changedValue = nextValue;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const clearButton = container.querySelector<HTMLButtonElement>('[data-part="clear-button"]');

    clearButton?.click();
    await nextTick();

    expect(selectedValues).toEqual([]);
    expect(changedValue).toEqual([]);
    expect(getSelectInput(container)?.value).toBe('');
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);

    app.unmount();
  });

  it('opens its menu from the trigger without requiring an explicit id', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        label: 'Coffee',
        options,
      }),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    const menu = container.querySelector<HTMLElement>('[role="listbox"]');
    const textField = container.querySelector<HTMLElement>('.m3-select-field');

    trigger?.click();
    await nextTick();

    expect(isPopoverOpen(menu)).toBe(true);
    expect(textField?.dataset.visuallyFocused).toBe('true');

    app.unmount();
  });

  it('does not render an outline notch when no label is provided', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        options,
        'aria-label': 'Coffee',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector('.m3-select-field .m3-text-field-outline legend')).toBeNull();

    app.unmount();
  });

  it('uses the outer select container as the dropdown anchor', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        label: 'Coffee',
        options,
      }),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-select-trigger');
    const textFieldContainer = container.querySelector<HTMLElement>('.m3-select-field .m3-text-field-container');
    const input = getSelectInput(container);

    expect(root?.style.getPropertyValue('anchor-name')).toBe('');
    expect(textFieldContainer?.style.getPropertyValue('anchor-name')).toContain('--m3-select-anchor-');
    expect(input?.style.getPropertyValue('anchor-name')).toBe('');

    app.unmount();
  });

  it('preserves existing TextField container anchor names', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        label: 'Coffee',
        options,
        type: 'date',
      }),
    );

    app.mount(container);
    await nextTick();

    const textFieldContainer = container.querySelector<HTMLElement>('.m3-select-field .m3-text-field-container');
    const anchorNames = textFieldContainer?.style.getPropertyValue('anchor-name') ?? '';

    expect(anchorNames).toContain('--m3-text-field-date-picker-anchor-');
    expect(anchorNames).toContain('--m3-select-anchor-');

    app.unmount();
  });

  it('forces selected items to use the check icon', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        label: 'Coffee',
        options,
        modelValue: 'espresso',
      }),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    trigger?.click();
    await nextTick();

    const selectedItemLeading = container.querySelector<HTMLElement>(
      '[role="option"][data-selected="true"] [data-scope="select-item"][data-part="check"]',
    );

    expect(selectedItemLeading?.textContent?.trim()).toBe('check');

    app.unmount();
  });

  it('shows the check icon for selected items even when options have no leading icons', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        label: 'Coffee',
        options: optionsWithoutIcons,
        modelValue: 'pour-over',
      }),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    trigger?.click();
    await nextTick();

    const selectedItemLeading = container.querySelector<HTMLElement>(
      '[role="option"][data-selected="true"] .m3-item-leading-slot',
    );

    expect(selectedItemLeading?.textContent?.trim()).toBe('check');

    app.unmount();
  });

  it('moves the check icon to the newly selected item when options have no leading icons', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      setup() {
        const value = ref<SelectOption['value'] | undefined>('pour-over');

        return () =>
          h(Select, {
            label: 'Coffee',
            options: optionsWithoutIcons,
            modelValue: value.value,
            'onUpdate:modelValue': (nextValue) => {
              value.value = nextValue as SelectOption['value'] | undefined;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    let trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    trigger?.click();
    await nextTick();

    let menuItems = container.querySelectorAll<HTMLButtonElement>('[role="option"]');
    menuItems[2]?.click();
    await nextTick();

    trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    trigger?.click();
    await nextTick();

    const selectedLeadings = container.querySelectorAll<HTMLElement>(
      '[role="option"][data-selected="true"] [data-scope="select-item"][data-part="check"]',
    );
    const selectedLabels = container.querySelectorAll<HTMLElement>(
      '[role="option"][data-selected="true"] .m3-item-title',
    );

    expect(selectedLeadings).toHaveLength(1);
    expect(selectedLeadings[0]?.textContent?.trim()).toBe('check');
    expect(selectedLabels[0]?.textContent?.trim()).toBe('Cold brew');

    app.unmount();
  });

  it('focuses the filter field and filters visible options when filterable is enabled', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const onClosed = vi.fn();

    const app = createApp(() =>
      h(Select, {
        label: 'State',
        options: stateOptions,
        filterable: true,
        filterPlaceholder: 'Filter states',
        onClosed,
      }),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    trigger?.click();
    await nextTick();
    await nextTick();

    const filterInput = getSelectInput(container);

    expect(filterInput).not.toBeNull();
    expect(document.activeElement).toBe(filterInput);

    if (!filterInput) {
      throw new Error('Expected filter input');
    }

    filterInput.value = 'co';
    filterInput.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    await nextTick();

    const visibleLabels = getCurrentOptions(container).map((item) =>
      item.querySelector('.m3-item-title')?.textContent?.trim(),
    );

    expect(visibleLabels).toEqual(['Colorado', 'Connecticut']);

    let finishExit!: () => void;
    const finished = new Promise<void>((resolve) => {
      finishExit = resolve;
    });
    const surface = container.querySelector<HTMLElement>('.m3-popover-surface')!;
    Object.defineProperty(surface, 'getAnimations', {
      configurable: true,
      value: () => [{ finished } as unknown as Animation],
    });

    filterInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    await nextTick();

    expect(onClosed).not.toHaveBeenCalled();
    expect(
      getCurrentOptions(container).map((item) => item.querySelector('.m3-item-title')?.textContent?.trim()),
    ).toEqual(['Colorado', 'Connecticut']);

    finishExit();
    await finished;
    await Promise.resolve();
    await nextTick();

    expect(onClosed).toHaveBeenCalledOnce();
    expect(getCurrentOptions(container)).toHaveLength(stateOptions.length);

    app.unmount();
  });

  it('shows a no-results message for unmatched filter text', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Select, {
        label: 'State',
        options: stateOptions,
        filterable: true,
      }),
    );

    app.mount(container);
    await nextTick();

    const trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    trigger?.click();
    await nextTick();
    await nextTick();

    const filterInput = getSelectInput(container);

    if (!filterInput) {
      throw new Error('Expected filter input');
    }

    filterInput.value = 'zz';
    filterInput.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    await nextTick();

    expect(getCurrentOptions(container)).toHaveLength(0);
    expect(container.querySelector('.m3-select-empty')?.textContent?.trim()).toBe('No matching options');

    app.unmount();
  });
});

it('exposes only one combobox and keeps ARIA on the native input', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const app = createApp(() =>
    h(Select, { options, 'aria-label': 'Choose', class: 'consumer-field', style: 'width: 300px' }),
  );
  app.mount(host);
  await nextTick();
  expect(host.querySelectorAll('[role="combobox"]')).toHaveLength(1);
  expect(host.querySelector('[role="combobox"]')?.tagName).toBe('INPUT');
  expect(host.querySelector<HTMLElement>('.consumer-field')?.style.width).toBe('300px');
  app.unmount();
});

describe('selected icon defaults', () => {
  it.each(['plugin', 'provide'] as const)(
    'resolves reactive %s defaults, subtree preferences, and explicit props for ordinary and custom lists',
    async (mode) => {
      installPopoverPolyfill();
      const preference = ref<boolean | undefined>(false);
      const explicit = ref<boolean | undefined>(true);
      const renderSelect = (id: string, custom: boolean, override?: boolean) =>
        h(
          Select,
          {
            id,
            options,
            modelValue: 'espresso',
            showSelectedIcon: override,
          },
          custom
            ? {
                list: () =>
                  h('div', [
                    h(SelectItem, { selected: true, leadingIcon: 'local_cafe' }, () => 'Espresso'),
                    h(
                      SelectItem,
                      { selected: true, showSelectedIcon: false, 'data-test': 'item-override' },
                      () => 'Override',
                    ),
                  ]),
              }
            : undefined,
        );
      const Subtree = {
        setup() {
          provideSelectDefaults({ showSelectedIcon: false });
          return () => h('section', { id: 'subtree' }, [renderSelect('subtree-select', false)]);
        },
      };
      const app = createApp(() =>
        h('main', [
          ...[false, true].flatMap((custom) => [
            h('section', { id: `inherited-${custom}` }, [renderSelect(`select-${custom}`, custom)]),
            h('section', { id: `explicit-${custom}` }, [renderSelect(`override-${custom}`, custom, explicit.value)]),
          ]),
          h(Subtree),
        ]),
      );
      if (mode === 'plugin') app.use(M3VuePlugin, { selectDefaults: { showSelectedIcon: preference } });
      else app.provide(selectContextKey, { showSelectedIcon: preference });
      const container = document.createElement('div');
      document.body.appendChild(container);
      app.mount(container);
      await nextTick();
      const assertMark = (id: string, expected: boolean) => {
        const option = container.querySelector(`#${id} [role="option"]`)!;
        expect(option.getAttribute('aria-selected')).toBe('true');
        expect(Boolean(option.querySelector('[data-part="check"]'))).toBe(expected);
        expect(option.querySelector('.m3-item-leading-slot')?.textContent?.trim()).toBe(
          expected ? 'check' : 'local_cafe',
        );
      };
      try {
        for (const custom of [false, true]) {
          assertMark(`inherited-${custom}`, false);
          assertMark(`explicit-${custom}`, true);
        }
        preference.value = true;
        explicit.value = false;
        await nextTick();
        for (const custom of [false, true]) {
          assertMark(`inherited-${custom}`, true);
          assertMark(`explicit-${custom}`, false);
        }
        preference.value = undefined;
        explicit.value = undefined;
        await nextTick();
        for (const custom of [false, true]) {
          assertMark(`inherited-${custom}`, true);
          assertMark(`explicit-${custom}`, true);
        }
        assertMark('subtree', false);
        for (const option of container.querySelectorAll('[data-test="item-override"]')) {
          expect(option.querySelector('[data-part="check"]')).toBeNull();
        }
      } finally {
        app.unmount();
      }
    },
  );
});
