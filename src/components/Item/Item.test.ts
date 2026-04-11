// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import Item from './Item.vue';

function createPointerEvent(type: string, init: EventInit & { pointerId?: number } = {}): Event {
  const event = new Event(type, init);
  Object.defineProperty(event, 'pointerId', {
    configurable: true,
    value: init.pointerId ?? 1,
  });
  return event;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Item', () => {
  it('renders default content with icon shortcuts', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Item, {
        title: 'Profile',
        description: 'Manage your account settings.',
        mediaIcon: 'person',
        actionIcon: 'chevron_right',
      }),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="item"][data-part="root"]');
    const title = container.querySelector<HTMLElement>('[data-scope="item"][data-part="title"]');
    const description = container.querySelector<HTMLElement>('[data-scope="item"][data-part="description"]');
    const media = container.querySelector<HTMLElement>('[data-scope="item"][data-part="media-icon"]');
    const action = container.querySelector<HTMLElement>('[data-scope="item"][data-part="action-icon"]');

    expect(root?.tagName).toBe('BUTTON');
    expect(root?.dataset.variant).toBe('default');
    expect(root?.dataset.size).toBe('default');
    expect(root?.dataset.clickable).toBe('true');
    expect(title?.textContent).toContain('Profile');
    expect(description?.textContent).toContain('Manage your account settings.');
    expect(media).not.toBeNull();
    expect(action).not.toBeNull();

    app.unmount();
  });

  it('supports disabled anchor mode and blocks href interaction', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Item, {
        href: '/settings',
        disabled: true,
        title: 'Open settings',
      }),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="item"][data-part="root"]');

    expect(root?.tagName).toBe('A');
    expect(root?.getAttribute('href')).toBeNull();
    expect(root?.getAttribute('aria-disabled')).toBe('true');
    expect(root?.getAttribute('tabindex')).toBe('-1');

    app.unmount();
  });

  it('can render a non-interactive layout container', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(Item, {
        clickable: false,
        title: 'Static item',
      }),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="item"][data-part="root"]');

    expect(root?.tagName).toBe('DIV');
    expect(root?.dataset.clickable).toBe('false');

    root?.dispatchEvent(createPointerEvent('pointerdown', { bubbles: true, pointerId: 2 }));
    await nextTick();

    expect(root?.dataset.pressed).toBe('false');

    app.unmount();
  });
});
