// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, h, nextTick, type App } from 'vue';
import { showOverlayEntry } from '@/internal/overlayHost/overlayHost';
import OverlayHost from './OverlayHost.vue';

let app: App<Element> | null = null;

afterEach(() => {
  app?.unmount();
  app = null;
  document.body.innerHTML = '';
});

describe('OverlayHost', () => {
  it('renders and removes programmatic entries without moving them outside the application', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    app = createApp(() => h(OverlayHost));
    app.mount(container);

    const handle = showOverlayEntry({
      render: () => h('div', { class: 'overlay-entry' }, 'Overlay content'),
    });

    await nextTick();

    expect(container.querySelector('.overlay-entry')?.textContent).toBe('Overlay content');
    expect(document.body.lastElementChild).toBe(container);

    handle.remove();
    await nextTick();

    expect(container.querySelector('.overlay-entry')).toBeNull();
  });

  it('notifies pending entries when the host is unmounted', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    app = createApp(() => h(OverlayHost));
    app.mount(container);

    const onHostUnmounted = vi.fn();

    showOverlayEntry({
      render: () => h('div'),
      onHostUnmounted,
    });

    app.unmount();
    app = null;

    expect(onHostUnmounted).toHaveBeenCalledOnce();
    expect(onHostUnmounted.mock.calls[0]?.[0]).toMatchObject({
      message: 'OverlayHost was unmounted before the overlay completed.',
    });
    expect(() => showOverlayEntry({ render: () => h('div') })).toThrow(
      'OverlayHost must be mounted before calling a programmatic overlay function.',
    );
  });
});
