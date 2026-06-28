// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
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

function getCurrentMenuItems(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="menuitemradio"], button[role="menuitemcheckbox"]'),
  ).filter(
    (item) =>
      !item.classList.contains('m3-select-options-leave-active') &&
      !item.classList.contains('m3-select-options-leave-to'),
  );
}

function getSelectInput(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>('.m3-select-field .m3-text-field-input');
}

describe('Select', () => {
  afterEach(() => {
    document.body.innerHTML = '';
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

    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const menuItems = container.querySelectorAll<HTMLButtonElement>(
      'button[role="menuitemradio"], button[role="menuitemcheckbox"]',
    );

    expect(getSelectInput(container)?.value).toBe('');

    menuItems[1]?.click();
    await nextTick();

    expect(selectedValue).toBe('pour-over');
    expect(getSelectInput(container)?.value).toBe('Pour-over');
    expect(isPopoverOpen(menu)).toBe(false);

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

    const menu = container.querySelector<HTMLElement>('[role="menu"]');
    const menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitemcheckbox"]');

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

    const menu = container.querySelector<HTMLElement>('[role="menu"]');
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
    const menu = container.querySelector<HTMLElement>('[role="menu"]');
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
      'button[role="menuitemradio"][data-selected="true"] .m3-select-option-check',
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
      'button[role="menuitemradio"][data-selected="true"] .m3-menu-item-leading',
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

    let menuItems = container.querySelectorAll<HTMLButtonElement>('button[role="menuitemradio"]');
    menuItems[2]?.click();
    await nextTick();

    trigger = container.querySelector<HTMLElement>('.m3-select-trigger');
    trigger?.click();
    await nextTick();

    const selectedLeadings = container.querySelectorAll<HTMLElement>(
      'button[role="menuitemradio"][data-selected="true"] .m3-select-option-check',
    );
    const selectedLabels = container.querySelectorAll<HTMLElement>(
      'button[role="menuitemradio"][data-selected="true"] .m3-menu-item-label',
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

    const app = createApp(() =>
      h(Select, {
        label: 'State',
        options: stateOptions,
        filterable: true,
        filterPlaceholder: 'Filter states',
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

    const visibleLabels = getCurrentMenuItems(container).map((item) =>
      item.querySelector('.m3-menu-item-label')?.textContent?.trim(),
    );

    expect(visibleLabels).toEqual(['Colorado', 'Connecticut']);

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

    expect(getCurrentMenuItems(container)).toHaveLength(0);
    expect(container.querySelector('.m3-select-empty')?.textContent?.trim()).toBe('No matching options');

    app.unmount();
  });
});
