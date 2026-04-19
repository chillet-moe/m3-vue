// @vitest-environment jsdom
import { describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import Badge from './Badge.vue';

describe('Badge', () => {
  it('renders a small badge by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(Badge);
      },
    });

    app.mount(container);
    await nextTick();

    const badge = container.querySelector('.m3-badge') as HTMLElement | null;

    expect(badge).not.toBeNull();
    expect(badge?.dataset.variant).toBe('small');
    expect(container.querySelector('.m3-badge-label')).toBeNull();

    app.unmount();
  });

  it('caps numeric content with max for large badges', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(Badge, {
          variant: 'large',
          content: 120,
          max: 99,
        });
      },
    });

    app.mount(container);
    await nextTick();

    const label = container.querySelector('.m3-badge-label') as HTMLElement | null;

    expect(label).not.toBeNull();
    expect(label?.textContent).toBe('99+');

    app.unmount();
  });

  it('allows slot content to replace rendered label content', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(
          Badge,
          {
            variant: 'large',
            content: 8,
          },
          {
            default: () => 'NEW',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const label = container.querySelector('.m3-badge-label') as HTMLElement | null;

    expect(label?.textContent).toBe('NEW');

    app.unmount();
  });
});
