// @vitest-environment jsdom
import { installPopoverPolyfill } from '../../../tests/unit/popover';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Combobox from './Combobox.vue';
import type { SelectOption } from '@/components/Select/Select.vue';

const stateOptions: SelectOption[] = [
  { label: 'Alabama', value: 'alabama' },
  { label: 'Alaska', value: 'alaska' },
  { label: 'Arizona', value: 'arizona' },
  { label: 'Arkansas', value: 'arkansas' },
  { label: 'California', value: 'california' },
  { label: 'Colorado', value: 'colorado' },
  { label: 'Connecticut', value: 'connecticut' },
];

function getCurrentMenuItems(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button[role="option"]')).filter(
    (item) =>
      !item.classList.contains('m3-select-options-leave-active') &&
      !item.classList.contains('m3-select-options-leave-to'),
  );
}

describe('Combobox', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('forwards label clearance to the public Select root without applying it twice', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Combobox, {
        label: 'State',
        options: stateOptions,
        labelClearance: '0.75rem',
      }),
    );

    app.mount(container);
    await nextTick();

    expect(container.querySelector<HTMLElement>('.m3-select')?.style.marginBlockStart).toBe('0.75rem');
    expect(container.querySelector<HTMLElement>('.m3-select-field')?.style.marginBlockStart).toBe('0rem');

    app.unmount();
  });

  it('keeps consumer attributes and native listeners current when only attrs change', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const alternate = ref(false);
    const onInitialClick = vi.fn();
    const onAlternateClick = vi.fn();
    const app = createApp(() =>
      h(Combobox, {
        options: stateOptions,
        class: alternate.value ? 'alternate' : 'initial',
        style: { '--md-menu-container-color': alternate.value ? 'blue' : 'red' },
        'aria-label': alternate.value ? 'Alternate state' : 'Choose a state',
        onClick: alternate.value ? onAlternateClick : onInitialClick,
      }),
    );
    app.mount(container);

    try {
      const root = container.querySelector<HTMLElement>('[data-scope="select"][data-part="root"]')!;
      const input = root.querySelector<HTMLInputElement>('[role="combobox"]')!;
      expect(input.getAttribute('aria-label')).toBe('Choose a state');
      root.click();
      expect(onInitialClick).toHaveBeenCalledOnce();

      alternate.value = true;
      await nextTick();

      expect(root.classList.contains('initial')).toBe(false);
      expect(root.classList.contains('alternate')).toBe(true);
      expect(root.style.getPropertyValue('--md-menu-container-color')).toBe('blue');
      expect(input.getAttribute('aria-label')).toBe('Alternate state');
      root.click();
      expect(onAlternateClick).toHaveBeenCalledOnce();
      expect(onInitialClick).toHaveBeenCalledOnce();
    } finally {
      app.unmount();
    }
  });

  it('enables filtering by default', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Combobox, {
        label: 'State',
        options: stateOptions,
        filterPlaceholder: 'Filter states',
      }),
    );

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-select-field .m3-text-field-input');

    expect(input?.readOnly).toBe(false);

    input?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    await nextTick();

    if (!input) {
      throw new Error('Expected combobox input');
    }

    input.value = 'co';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    await nextTick();

    const visibleLabels = getCurrentMenuItems(container).map((item) =>
      item.querySelector('.m3-menu-item-label')?.textContent?.trim(),
    );

    expect(visibleLabels).toEqual(['Colorado', 'Connecticut']);

    app.unmount();
  });

  it('forwards the closed event from Select', async () => {
    installPopoverPolyfill();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const open = ref(true);
    const onClosed = vi.fn();
    const app = createApp(() =>
      h(Combobox, {
        label: 'State',
        options: stateOptions,
        open: open.value,
        'onUpdate:open': (nextOpen: boolean) => {
          open.value = nextOpen;
        },
        onClosed,
      }),
    );

    app.mount(container);
    await nextTick();

    container.querySelector<HTMLElement>('[role="listbox"]')?.hidePopover();
    await nextTick();
    await Promise.resolve();

    expect(open.value).toBe(false);
    expect(onClosed).toHaveBeenCalledOnce();
    app.unmount();
  });
});
