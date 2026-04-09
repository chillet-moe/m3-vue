// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { showSnackbar } from './showSnackbar';

function installPopoverPolyfill() {
  const prototype = HTMLElement.prototype as HTMLElement & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };

  if (typeof prototype.showPopover !== 'function') {
    Object.defineProperty(prototype, 'showPopover', {
      configurable: true,
      value: function (this: HTMLElement) {
        this.hidden = false;
        this.dataset.popoverOpen = 'true';
      },
    });
  }

  if (typeof prototype.hidePopover !== 'function') {
    Object.defineProperty(prototype, 'hidePopover', {
      configurable: true,
      value: function (this: HTMLElement) {
        delete this.dataset.popoverOpen;
        this.hidden = true;
      },
    });
  }
}

beforeAll(() => {
  installPopoverPolyfill();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('showSnackbar', () => {
  it('resolves with the action value when the action button is pressed', async () => {
    const result = showSnackbar({
      message: 'Draft archived.',
      action: {
        label: 'Undo',
        value: 'undo',
      },
      dismissible: true,
      duration: null,
    });

    await nextTick();

    const buttons = [...document.querySelectorAll('button')];
    const actionButton = buttons.find((button) => button.textContent?.includes('Undo'));

    expect(actionButton).toBeDefined();

    actionButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect(result).resolves.toBe('undo');
    await Promise.resolve();

    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });

  it('allows multiple snackbars to be shown at the same time', async () => {
    const first = showSnackbar({
      message: 'First snackbar',
      dismissible: true,
      duration: null,
    });
    const second = showSnackbar({
      message: 'Second snackbar',
      dismissible: true,
      duration: null,
    });

    await nextTick();

    const messages = [...document.querySelectorAll('[role="status"]')].map((element) =>
      element.querySelector('[id^="snackbar-content-"]')?.textContent?.trim(),
    );
    expect(messages).toContain('First snackbar');
    expect(messages).toContain('Second snackbar');

    let dismissButtons = [...document.querySelectorAll('button')].filter(
      (button) => button.getAttribute('aria-label') === 'Dismiss notification',
    );

    dismissButtons[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await expect(first).resolves.toBe('dismiss');

    await nextTick();

    expect(
      [...document.querySelectorAll('[role="status"]')].map((element) =>
        element.querySelector('[id^="snackbar-content-"]')?.textContent?.trim(),
      ),
    ).toEqual(['Second snackbar']);

    dismissButtons = [...document.querySelectorAll('button')].filter(
      (button) => button.getAttribute('aria-label') === 'Dismiss notification',
    );
    dismissButtons[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect(second).resolves.toBe('dismiss');
    await Promise.resolve();

    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });

  it('mounts separate stacks for different positions', async () => {
    const top = showSnackbar({
      message: 'Top snackbar',
      dismissible: true,
      duration: null,
      position: 'top-end',
    });
    const bottom = showSnackbar({
      message: 'Bottom snackbar',
      dismissible: true,
      duration: null,
      position: 'bottom-start',
    });

    await nextTick();

    expect(document.querySelector('[popover="manual"][data-position="top-end"]')).not.toBeNull();
    expect(document.querySelector('[popover="manual"][data-position="bottom-start"]')).not.toBeNull();

    const dismissButtons = [...document.querySelectorAll('button')].filter(
      (button) => button.getAttribute('aria-label') === 'Dismiss notification',
    );

    dismissButtons[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    dismissButtons[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect(top).resolves.toBe('dismiss');
    await expect(bottom).resolves.toBe('dismiss');
  });

  it('resolves with the timeout value after the duration elapses', async () => {
    vi.useFakeTimers();

    const result = showSnackbar({
      message: 'Saved',
      duration: 2_000,
      timeoutValue: 'expired',
    });

    await nextTick();
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(result).resolves.toBe('expired');
    await Promise.resolve();

    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });
});
