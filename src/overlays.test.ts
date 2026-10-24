// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, type App } from 'vue';
import { OverlayHost } from './components/OverlayHost';
import { createOverlayHost, provideOverlayHost } from './internal/overlayHost/overlayHost';
import { createOverlayService, useOverlays, type OverlayService } from './overlays';

const apps: App[] = [];
afterEach(() => {
  for (const app of apps.splice(0)) app.unmount();
  document.body.replaceChildren();
});

describe('overlay services', () => {
  it('binds component calls to the nearest host and keeps them bound outside setup', async () => {
    const services: OverlayService[] = [];
    const Child = defineComponent({
      setup() {
        services.push(useOverlays());
        return () => null;
      },
    });
    for (let index = 0; index < 2; index++) {
      const Root = defineComponent({
        setup() {
          const host = provideOverlayHost(createOverlayHost());
          return () => [h(OverlayHost, { host }), h(Child)];
        },
      });
      const container = document.createElement('div');
      document.body.append(container);
      const app = createApp(Root);
      apps.push(app);
      app.mount(container);
    }
    const { showDialog: firstDialog } = services[0]!;
    const { showDialog: secondDialog } = services[1]!;
    const first = firstDialog({ headline: 'First' });
    const second = secondDialog({ headline: 'Second' });
    const firstResult = expect(first).rejects.toThrow('disposed');
    const secondResult = expect(second).rejects.toThrow('disposed');
    apps.shift()!.unmount();
    // The other host can still accept calls after its sibling is disposed.
    const extra = secondDialog({ headline: 'Still mounted' });
    const extraResult = expect(extra).rejects.toThrow('disposed');
    apps.shift()!.unmount();
    await Promise.all([firstResult, secondResult, extraResult]);
    await expect(firstDialog()).rejects.toThrow('must be mounted');
  });

  it('can bind outside setup before mounting but rejects calls without a mounted owner', async () => {
    const { showDialog, showSnackbar } = createOverlayService(createOverlayHost());
    await expect(showDialog()).rejects.toThrow('must be mounted');
    await expect(showSnackbar()).rejects.toThrow('must be mounted');
  });

  it('requires an explicitly provided host', () => {
    const app = createApp({ render: () => null });
    expect(() => app.runWithContext(() => useOverlays())).toThrow('Provide an overlay host');
  });
});
