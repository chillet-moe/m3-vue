// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, type App } from 'vue';
import { buttonContextKey } from '@/components/Button';
import { OverlayHost } from '@/components/OverlayHost';
import { showDialog } from './showDialog';

let app: App<Element> | null = null;

function mountOverlayHost(buttonShape?: 'rounded' | 'square') {
  const container = document.createElement('div');
  document.body.appendChild(container);

  app = createApp(() => h(OverlayHost));

  if (buttonShape) {
    app.provide(buttonContextKey, { shape: buttonShape });
  }

  app.mount(container);
}

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

beforeEach(() => {
  mountOverlayHost();
});

afterEach(() => {
  app?.unmount();
  app = null;
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  document.body.removeAttribute('data-m3-scroll-lock');
  document.documentElement.removeAttribute('style');
});

describe('showDialog', () => {
  it('rejects when OverlayHost is not mounted', async () => {
    app?.unmount();
    app = null;

    await expect(showDialog()).rejects.toThrow(
      'OverlayHost must be mounted before calling a programmatic overlay function.',
    );
  });

  it('inherits Button context from the application hosting OverlayHost', async () => {
    app?.unmount();
    mountOverlayHost('square');

    const result = showDialog();

    await nextTick();

    const button = document.querySelector<HTMLButtonElement>('.m3-button');

    expect(button?.dataset.shape).toBe('square');

    button?.click();
    await expect(result).resolves.toBe('confirm');
  });

  it('rejects a pending dialog when OverlayHost is unmounted', async () => {
    const result = showDialog();

    await nextTick();

    app?.unmount();
    app = null;

    await expect(result).rejects.toThrow('OverlayHost was unmounted before the overlay completed.');
    expect(document.body.style.overflow).toBe('');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(false);
  });

  it('mounts a dialog and resolves with the selected action value', async () => {
    const result = showDialog({
      headline: 'Delete file?',
      content: 'This action cannot be undone.',
      actions: [
        { label: 'Cancel', value: 'cancel' },
        { label: 'Delete', value: 'confirm' },
      ],
    });

    await nextTick();

    const buttons = [...document.querySelectorAll('button')];
    const deleteButton = buttons.find((button) => button.textContent?.includes('Delete'));

    expect(deleteButton).toBeDefined();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(true);

    deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect(result).resolves.toBe('confirm');
    await Promise.resolve();

    expect(document.querySelector('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(false);
  });

  it('resolves on close but keeps the overlay mounted until the exit finishes', async () => {
    let finishExit!: () => void;
    const finished = new Promise<void>((resolve) => {
      finishExit = resolve;
    });
    const result = showDialog();

    await nextTick();

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    const surface = dialog.querySelector<HTMLElement>('[data-part="surface"]')!;

    Object.defineProperty(surface, 'getAnimations', {
      configurable: true,
      value: () => [{ finished } as unknown as Animation],
    });

    document.querySelector<HTMLButtonElement>('button')?.click();

    await expect(result).resolves.toBe('confirm');
    expect(document.querySelector('dialog')).toBe(dialog);

    finishExit();
    await finished;
    await Promise.resolve();
    await nextTick();

    expect(document.querySelector('dialog')).toBeNull();
  });

  it('resolves with an empty string when dismissed by backdrop click', async () => {
    const result = showDialog({
      headline: 'Delete file?',
      content: 'This action cannot be undone.',
    });

    await nextTick();

    const dialog = document.querySelector('dialog') as HTMLDialogElement | null;

    expect(dialog).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(true);

    dialog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect(result).resolves.toBe('');
    await Promise.resolve();

    expect(document.querySelector('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.body.hasAttribute('data-m3-scroll-lock')).toBe(false);
  });
});
