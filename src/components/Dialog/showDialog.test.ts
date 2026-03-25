// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { showDialog } from './showDialog';

function installDialogPolyfill() {
  const prototype = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void;
    close?: (returnValue?: string) => void;
  };

  if (typeof prototype.showModal !== 'function') {
    Object.defineProperty(prototype, 'showModal', {
      configurable: true,
      value: function(this: HTMLDialogElement) {
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
      value: function(this: HTMLDialogElement, returnValue = '') {
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

describe('showDialog', () => {
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

    deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect(result).resolves.toBe('confirm');
    await Promise.resolve();

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

    dialog?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect(result).resolves.toBe('');
    await Promise.resolve();

    expect(document.querySelector('dialog')).toBeNull();
  });
});
