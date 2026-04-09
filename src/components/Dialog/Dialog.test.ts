// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Dialog from './Dialog.vue';

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
});

describe('Dialog', () => {
  it('syncs v-model:open with the native dialog open state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(
            Dialog,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
            },
            {
              headline: () => 'Delete file?',
              default: () => 'This action cannot be undone.',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog).not.toBeNull();
    expect(dialog?.open).toBe(true);

    open.value = false;
    await nextTick();

    expect(dialog?.open).toBe(false);

    app.unmount();
  });

  it('updates the model and emits the return value when the native dialog closes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const onClose = vi.fn();
    const app = createApp({
      setup() {
        return () =>
          h(
            Dialog,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
              onClose,
            },
            {
              headline: () => 'Delete file?',
              default: () => 'This action cannot be undone.',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog).not.toBeNull();

    dialog?.close('confirmed');
    await nextTick();

    expect(open.value).toBe(false);
    expect(onClose).toHaveBeenCalledWith('confirmed');

    app.unmount();
  });

  it('emits cancel when the native cancel event fires', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const onCancel = vi.fn();
    const app = createApp({
      setup() {
        return () =>
          h(
            Dialog,
            {
              open: true,
              onCancel,
            },
            {
              headline: () => 'Delete file?',
              default: () => 'This action cannot be undone.',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog).not.toBeNull();

    dialog?.dispatchEvent(new Event('cancel', { cancelable: true }));
    await nextTick();

    expect(onCancel).toHaveBeenCalledTimes(1);

    app.unmount();
  });

  it('closes when the backdrop is clicked', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const open = ref(true);
    const app = createApp({
      setup() {
        return () =>
          h(
            Dialog,
            {
              open: open.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value;
              },
            },
            {
              headline: () => 'Delete file?',
              default: () => 'This action cannot be undone.',
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const dialog = container.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog).not.toBeNull();

    dialog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(open.value).toBe(false);
    expect(dialog?.open).toBe(false);

    app.unmount();
  });
});
