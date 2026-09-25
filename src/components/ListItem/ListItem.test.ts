// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import ListItem from './ListItem.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ListItem', () => {
  it('renders default content with button icon shortcuts', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(ListItem, {
        title: 'Profile',
        description: 'Manage your account settings.',
        leadingIcon: 'person',
        trailingIcon: 'chevron_right',
      }),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="item"][data-part="root"]');
    const title = container.querySelector<HTMLElement>('[data-scope="item"][data-part="title"]');
    const description = container.querySelector<HTMLElement>('[data-scope="item"][data-part="description"]');
    const leading = container.querySelector<HTMLElement>('[data-scope="item"][data-part="leading"]');
    const trailing = container.querySelector<HTMLElement>('[data-scope="item"][data-part="trailing"]');

    expect(root?.tagName).toBe('BUTTON');
    expect(root?.hasAttribute('data-list-group-item')).toBe(true);
    expect(root?.dataset.size).toBe('small');
    expect(title?.textContent).toContain('Profile');
    expect(description?.textContent).toContain('Manage your account settings.');
    expect(leading).not.toBeNull();
    expect(trailing).not.toBeNull();
    expect(leading?.classList.contains('m3-icon-morph')).toBe(true);
    expect(trailing?.classList.contains('m3-icon-morph')).toBe(true);
    expect(title?.classList.contains('m3-text-morph')).toBe(true);
    expect(description?.classList.contains('m3-text-morph')).toBe(true);

    app.unmount();
  });

  it('supports disabled anchor mode and blocks href interaction', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(ListItem, {
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

  it('renders a non-interactive item without action semantics', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(ListItem, {
        interactive: false,
        href: '/settings',
        active: true,
        title: 'Account status',
      }),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="item"][data-part="root"]');

    expect(root?.tagName).toBe('DIV');
    expect(root?.dataset.interactive).toBe('false');
    expect(root?.classList.contains('m3-button')).toBe(false);
    expect(root?.classList.contains('m3-state-layer')).toBe(false);
    expect(root?.getAttribute('data-pressed')).toBeNull();
    expect(root?.getAttribute('href')).toBeNull();
    expect(root?.getAttribute('type')).toBeNull();
    expect(root?.getAttribute('tabindex')).toBeNull();
    expect(root?.getAttribute('aria-current')).toBeNull();

    app.unmount();
  });

  it('supports active state with leading and trailing slots', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        ListItem,
        {
          active: true,
        },
        {
          leading: () => h('span', { id: 'item-leading' }, 'L'),
          default: () => 'Active item',
          description: () => 'Uses navigation-rail-like active indicator.',
          trailing: () => h('span', { id: 'item-trailing' }, 'R'),
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="item"][data-part="root"]');
    const leading = container.querySelector<HTMLElement>('[data-scope="item"][data-part="leading"]');
    const trailing = container.querySelector<HTMLElement>('[data-scope="item"][data-part="trailing"]');

    expect(root?.dataset.active).toBe('true');
    expect(root?.dataset.selected).toBe('true');
    expect(root?.getAttribute('aria-current')).toBe('page');
    expect(leading?.textContent).toContain('L');
    expect(trailing?.textContent).toContain('R');

    app.unmount();
  });
});
