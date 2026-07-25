// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h } from 'vue';
import Snackbar from './Snackbar.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Snackbar', () => {
  it('emits action and dismiss events', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const onAction = vi.fn();
    const onDismiss = vi.fn();
    const app = createApp({
      setup() {
        return () =>
          h(
            Snackbar,
            {
              actionLabel: 'Undo',
              actionOnNewLine: true,
              dismissible: true,
              onAction,
              onDismiss,
            },
            {
              default: () => 'Draft archived.',
            },
          );
      },
    });

    app.mount(container);

    const buttons = [...container.querySelectorAll('button')];
    const actionButton = buttons.find((button) => button.textContent?.includes('Undo'));
    const dismissButton = buttons.find((button) => button.getAttribute('aria-label') === 'Dismiss notification');

    actionButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    dismissButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-action-layout="new-line"]')).not.toBeNull();

    app.unmount();
  });
});
