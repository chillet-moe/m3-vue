// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h } from 'vue';
import Skeleton from './Skeleton.vue';

describe('Skeleton', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an aria-hidden decorative placeholder by default', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render: () => h(Skeleton),
    });

    app.mount(container);

    const root = container.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="root"]');
    expect(root?.tagName).toBe('DIV');
    expect(root?.classList.contains('m3-skeleton')).toBe(true);
    expect(root?.dataset.animation).toBe('pulse');
    expect(root?.getAttribute('aria-hidden')).toBe('true');

    app.unmount();
  });

  it('supports custom root tags and animation modes', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render: () => h(Skeleton, { as: 'span', animation: 'wave' }),
    });

    app.mount(container);

    const root = container.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="root"]');
    expect(root?.tagName).toBe('SPAN');
    expect(root?.dataset.animation).toBe('wave');

    app.unmount();
  });
});
