// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import Divider from './Divider.vue';

async function mountDivider(props: Record<string, unknown> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const app = createApp({
    render() {
      return h(Divider, props);
    },
  });

  app.mount(container);
  await nextTick();

  return {
    app,
    root: container.querySelector('.m3-divider') as HTMLElement | null,
  };
}

describe('Divider', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a horizontal separator by default', async () => {
    const { app, root } = await mountDivider();

    expect(root).not.toBeNull();
    expect(root?.dataset.scope).toBe('divider');
    expect(root?.dataset.part).toBe('root');
    expect(root?.dataset.orientation).toBe('horizontal');
    expect(root?.dataset.inset).toBe('none');
    expect(root?.getAttribute('role')).toBe('separator');
    expect(root?.getAttribute('aria-orientation')).toBe('horizontal');

    app.unmount();
  });

  it('supports vertical orientation and inset spacing', async () => {
    const { app, root } = await mountDivider({
      orientation: 'vertical',
      inset: 'both',
    });

    expect(root?.dataset.orientation).toBe('vertical');
    expect(root?.dataset.inset).toBe('both');
    expect(root?.getAttribute('aria-orientation')).toBe('vertical');

    app.unmount();
  });

  it('supports custom thickness and spacing', async () => {
    const { app, root } = await mountDivider({
      thickness: '2px',
      spacing: '0.75rem',
    });

    expect(root?.style.getPropertyValue('--md-divider-thickness')).toBe('2px');
    expect(root?.style.getPropertyValue('--md-divider-spacing')).toBe('0.75rem');

    app.unmount();
  });
});
