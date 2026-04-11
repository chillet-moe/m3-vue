// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
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
  };

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

function getCurrentMenuItems(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="menuitemradio"], button[role="menuitemcheckbox"]'),
  ).filter(
    (item) =>
      !item.classList.contains('m3-select-options-leave-active') &&
      !item.classList.contains('m3-select-options-leave-to'),
  );
}

describe('Combobox', () => {
  afterEach(() => {
    document.body.innerHTML = '';
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
});
