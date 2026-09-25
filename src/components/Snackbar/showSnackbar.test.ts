// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue';
import { buttonContextKey } from '@/components/Button';
import { iconButtonContextKey } from '@/components/IconButton';
import { OverlayHost } from '@/components/OverlayHost';
import { M3VuePlugin } from '@/plugin';
import { provideSnackbarDefaults, type ShowSnackbarDefaults } from './config';
import { showSnackbar, useSnackbar, type UseSnackbarReturn } from './showSnackbar';

let app: App<Element> | null = null;

function mountOverlayHost(actionShape?: 'rounded' | 'square', snackbarDefaults?: ShowSnackbarDefaults) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  app = createApp(() => h(OverlayHost));

  if (snackbarDefaults) {
    app.use(M3VuePlugin, { snackbarDefaults });
  }

  if (actionShape) {
    app.provide(buttonContextKey, { shape: actionShape });
    app.provide(iconButtonContextKey, { shape: actionShape });
  }

  app.mount(container);
}

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

beforeEach(() => {
  mountOverlayHost();
});

afterEach(() => {
  vi.useRealTimers();
  app?.unmount();
  app = null;
  document.body.innerHTML = '';
});

describe('showSnackbar', () => {
  it('rejects when OverlayHost is not mounted', async () => {
    app?.unmount();
    app = null;

    await expect(showSnackbar()).rejects.toThrow(
      'OverlayHost must be mounted before calling a programmatic overlay function.',
    );
  });

  it('inherits action contexts from the application hosting OverlayHost', async () => {
    app?.unmount();
    mountOverlayHost('square');

    const result = showSnackbar({
      message: 'Draft archived.',
      action: {
        label: 'Undo',
      },
      dismissible: true,
      duration: null,
    });

    await nextTick();

    expect(document.querySelector<HTMLButtonElement>('.m3-button')?.dataset.shape).toBe('square');
    expect(document.querySelector<HTMLButtonElement>('.m3-icon-button')?.dataset.shape).toBe('square');

    document.querySelector<HTMLButtonElement>('.m3-icon-button')?.click();
    await expect(result).resolves.toBe('dismiss');
  });

  it('shows a dismiss button by default', async () => {
    const result = showSnackbar({
      message: 'Draft archived.',
      duration: null,
    });

    await nextTick();

    const dismissButton = document.querySelector<HTMLButtonElement>('[aria-label="Dismiss notification"]');
    expect(dismissButton).not.toBeNull();

    dismissButton?.click();
    await expect(result).resolves.toBe('dismiss');
  });

  it('allows the default dismiss button to be disabled', async () => {
    const result = showSnackbar({
      message: 'Draft archived.',
      action: { label: 'Undo' },
      dismissible: false,
      duration: null,
    });

    await nextTick();

    expect(document.querySelector('[aria-label="Dismiss notification"]')).toBeNull();

    document.querySelector<HTMLButtonElement>('.m3-snackbar-action-button')?.click();
    await expect(result).resolves.toBe('action');
  });

  it('uses OverlayHost defaults while allowing individual calls to override them', async () => {
    app?.unmount();
    mountOverlayHost(undefined, {
      dismissible: false,
      dismissValue: 'closed-by-default',
      position: 'top-end',
    });

    const defaultResult = showSnackbar({
      message: 'Draft archived.',
      action: { label: 'Undo' },
      duration: null,
    });

    await nextTick();

    expect(document.querySelector('[popover="manual"][data-position="top-end"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Dismiss notification"]')).toBeNull();

    document.querySelector<HTMLButtonElement>('.m3-snackbar-action-button')?.click();
    await expect(defaultResult).resolves.toBe('action');

    const overriddenResult = showSnackbar({
      message: 'Draft archived.',
      dismissible: true,
      duration: null,
    });

    await nextTick();

    const dismissButton = document.querySelector<HTMLButtonElement>('[aria-label="Dismiss notification"]');
    expect(dismissButton).not.toBeNull();

    dismissButton?.click();
    await expect(overriddenResult).resolves.toBe('closed-by-default');
  });

  it('inherits reactive defaults from the nearest component provider through useSnackbar', async () => {
    app?.unmount();

    const localDefaults = ref<ShowSnackbarDefaults>({
      dismissible: false,
      dismissValue: 'local-dismiss',
    });
    let showLocalSnackbar: UseSnackbarReturn | undefined;

    const Child = defineComponent({
      setup() {
        showLocalSnackbar = useSnackbar();
        return () => null;
      },
    });
    const Provider = defineComponent({
      setup() {
        provideSnackbarDefaults(localDefaults);
        return () => h(Child);
      },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    app = createApp(() => h('div', [h(OverlayHost), h(Provider)]));
    app.use(M3VuePlugin, {
      snackbarDefaults: {
        dismissible: true,
        position: 'top-end',
      },
    });
    app.mount(container);

    const firstResult = showLocalSnackbar?.({
      message: 'First message',
      action: { label: 'Close' },
      duration: null,
    });
    await nextTick();

    expect(document.querySelector('[popover="manual"][data-position="top-end"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Dismiss notification"]')).toBeNull();

    document.querySelector<HTMLButtonElement>('.m3-snackbar-action-button')?.click();
    await expect(firstResult).resolves.toBe('action');

    localDefaults.value = { dismissible: true, dismissValue: 'updated-local-dismiss' };

    const secondResult = showLocalSnackbar?.({ message: 'Second message', duration: null });
    await nextTick();

    document.querySelector<HTMLButtonElement>('[aria-label="Dismiss notification"]')?.click();
    await expect(secondResult).resolves.toBe('updated-local-dismiss');
  });

  it('rejects a pending snackbar when OverlayHost is unmounted', async () => {
    const result = showSnackbar({
      message: 'Draft archived.',
      duration: null,
    });

    await nextTick();

    app?.unmount();
    app = null;

    await expect(result).rejects.toThrow('OverlayHost was unmounted before the overlay completed.');
  });

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
