// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import Badge from './Badge.vue';

describe('Badge', () => {
  it('derives accessible state from content, labels, and visibility', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h('div', [
          h(Badge),
          h(Badge, { variant: 'large', content: 8 }),
          h(Badge, {
            variant: 'large',
            content: 8,
            ariaLabel: 'Unread notifications',
            hidden: true,
          }),
        ]);
      },
    });

    app.mount(container);
    await nextTick();

    const badges = container.querySelectorAll<HTMLElement>('.m3-badge');

    expect(badges[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(badges[0]?.querySelector('.m3-badge-label')).toBeNull();
    expect(badges[1]?.getAttribute('aria-label')).toBe('8');
    expect(badges[1]?.getAttribute('aria-hidden')).toBeNull();
    expect(badges[2]?.getAttribute('aria-label')).toBe('Unread notifications');
    expect(badges[2]?.getAttribute('aria-hidden')).toBe('true');
    expect(badges[2]?.dataset.hidden).toBe('true');

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
