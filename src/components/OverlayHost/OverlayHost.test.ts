// @vitest-environment jsdom
import { createOverlayHost, registerOverlayHost } from '@/internal/overlayHost/overlayHost';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, onMounted, shallowRef, type App } from 'vue';
import { showOverlayEntry } from '@/internal/overlayHost/overlayHost';
import OverlayHost from './OverlayHost.vue';

const overlayHost = createOverlayHost();
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

    app = createApp(() => h(OverlayHost, { host: overlayHost }));
    app.mount(container);

    const handle = showOverlayEntry(overlayHost, {
      render: () => h('div', { class: 'overlay-entry' }, 'Overlay content'),
    });

    await nextTick();

    expect(container.querySelector('.overlay-entry')?.textContent).toBe('Overlay content');
    expect(document.body.lastElementChild).toBe(container);

    handle.remove();
    await nextTick();

    expect(container.querySelector('.overlay-entry')).toBeNull();
  });

  it('is available to slotted content mounted hooks', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const Content = defineComponent({
      setup() {
        onMounted(() => showOverlayEntry(overlayHost, { render: () => h('p', 'Mounted overlay') }));
        return () => h('span', 'Content');
      },
    });
    app = createApp(() => h(OverlayHost, { host: overlayHost }, { default: () => h(Content) }));
    app.mount(container);
    await nextTick();
    expect(container.textContent).toContain('Mounted overlay');
  });

  it('rejects duplicate ownership and tolerates repeated release', () => {
    const host = createOverlayHost();
    const element = document.createElement('div');
    const entries = shallowRef([]);
    const release = registerOverlayHost(host, entries, element, () => undefined);
    expect(() => registerOverlayHost(host, shallowRef([]), element, () => undefined)).toThrow('already mounted');
    release();
    release();
    const releaseNext = registerOverlayHost(host, shallowRef([]), element, () => undefined);
    release(); // A stale disposer must not unregister the new owner.
    expect(() => showOverlayEntry(host, { render: () => null })).not.toThrow();
    releaseNext();
  });

  it('notifies pending entries when the host is unmounted', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    app = createApp(() => h(OverlayHost, { host: overlayHost }));
    app.mount(container);

    const onHostUnmounted = vi.fn();

    showOverlayEntry(overlayHost, {
      render: () => h('div'),
      onHostUnmounted,
    });

    app.unmount();
    app = null;

    expect(onHostUnmounted).toHaveBeenCalledOnce();
    expect(onHostUnmounted.mock.calls[0]?.[0]).toMatchObject({
      message: 'OverlayHost was disposed before the overlay completed.',
    });
    expect(() => showOverlayEntry(overlayHost, { render: () => h('div') })).toThrow(
      'OverlayHost must be mounted before showing an overlay.',
    );
  });
});
