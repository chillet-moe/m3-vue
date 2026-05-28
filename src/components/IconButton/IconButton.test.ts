// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import IconButton from './IconButton.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('IconButton', () => {
  it('uses title as a component tooltip and an aria-label fallback', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(IconButton, {
          icon: 'settings',
          title: 'Settings',
        });
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;
    const tooltip = document.body.querySelector<HTMLElement>('.m3-tooltip');

    expect(button?.hasAttribute('title')).toBe(false);
    expect(button?.getAttribute('aria-label')).toBe('Settings');
    expect(button?.getAttribute('aria-controls')).toBe(tooltip?.id);
    expect(tooltip?.textContent).toBe('Settings');
    expect(tooltip?.getAttribute('role')).toBe('tooltip');

    app.unmount();
  });

  it('does not override an explicit aria-label with title text', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(IconButton, {
          icon: 'settings',
          title: 'Settings tooltip',
          'aria-label': 'Open settings',
        });
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;
    const tooltip = document.body.querySelector<HTMLElement>('.m3-tooltip');

    expect(button?.hasAttribute('title')).toBe(false);
    expect(button?.getAttribute('aria-label')).toBe('Open settings');
    expect(tooltip?.textContent).toBe('Settings tooltip');

    app.unmount();
  });
});
