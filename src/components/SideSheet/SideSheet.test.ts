// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import SideSheet from './SideSheet.vue';

function installDialogPolyfill() {
  const prototype = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void;
    close?: (returnValue?: string) => void;
  };

  if (typeof prototype.showModal !== 'function') {
    Object.defineProperty(prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        if (this.open) {
          return;
        }

        this.setAttribute('open', '');
      },
    });
  }

  if (typeof prototype.close !== 'function') {
    Object.defineProperty(prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement, returnValue = '') {
        if (!this.open) {
          return;
        }

        this.returnValue = returnValue;
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      },
    });
  }
}

beforeAll(() => {
  installDialogPolyfill();
});

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});

describe('SideSheet', () => {
  it('syncs v-model:open with the native dialog open state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(
            SideSheet,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
            },
            {
              headline: () => 'Details',
              default: () => 'Supplemental content.',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);
    expect(dialog?.dataset.scope).toBe('side-sheet');
    expect(dialog?.dataset.side).toBe('end');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--scrollbar-width')).not.toBe('');

    open.value = false;
    await nextTick();

    expect(dialog?.open).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(false);
    expect(document.documentElement.style.getPropertyValue('--scrollbar-width')).toBe('');

    app.unmount();
  });

  it('updates the model and emits the return value when closed', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const onClose = vi.fn();
    const app = createApp({
      setup() {
        return () =>
          h(SideSheet, {
            open: open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value;
            },
            onClose,
          });
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    dialog?.close('done');
    await nextTick();

    expect(open.value).toBe(false);
    expect(onClose).toHaveBeenCalledWith('done');
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.getPropertyValue('--scrollbar-width')).toBe('');

    app.unmount();
  });

  it('supports start side, custom width, and backdrop closing', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(SideSheet, {
            open: open.value,
            side: 'start',
            width: '24rem',
            'onUpdate:open': (value: boolean) => {
              open.value = value;
            },
          });
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog?.dataset.side).toBe('start');
    expect(dialog?.style.getPropertyValue('--md-side-sheet-width')).toBe('24rem');

    dialog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(open.value).toBe(false);

    app.unmount();
  });
});
