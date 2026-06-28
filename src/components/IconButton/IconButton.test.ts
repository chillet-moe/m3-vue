// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, withDirectives } from 'vue';
import { vDropdown } from '@/directives/Menu';
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

  it('keeps title tooltip positioning when the same button opens a dropdown menu', async () => {
    const container = document.createElement('div');
    const menu = document.createElement('div');
    document.body.append(container, menu);

    const app = createApp({
      render() {
        return withDirectives(
          h(IconButton, {
            icon: 'more_vert',
            title: '更多操作',
          }),
          [[vDropdown, menu]],
        );
      },
    });

    app.mount(container);
    await nextTick();

    const button = container.querySelector('button') as HTMLButtonElement | null;
    const tooltip = document.body.querySelector<HTMLElement>('.m3-tooltip');
    const buttonAnchorNames = button?.style.getPropertyValue('anchor-name') ?? '';
    const tooltipAnchorName = tooltip?.style.getPropertyValue('position-anchor') ?? '';
    const menuAnchorName = menu.style.getPropertyValue('position-anchor');

    expect(buttonAnchorNames).toContain(tooltipAnchorName);
    expect(buttonAnchorNames).toContain(menuAnchorName);
    expect(tooltipAnchorName).toContain('--vtt-anchor-');
    expect(menuAnchorName).toContain('--m3-dropdown-anchor-');

    app.unmount();
  });
});
