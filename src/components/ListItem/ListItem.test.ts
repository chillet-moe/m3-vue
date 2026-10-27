// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import ListItem, { type ListItemSize } from './ListItem.vue';
import { M3VuePlugin } from '@/plugin';
import { provideListItemDefaults } from './ListItemContext';

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
    expect(root?.dataset.size).toBe('medium');
    expect(title?.textContent).toContain('Profile');
    expect(description?.textContent).toContain('Manage your account settings.');
    expect(leading).not.toBeNull();
    expect(trailing).not.toBeNull();
    expect(leading?.classList.contains('m3-icon-morph')).toBe(false);
    expect(trailing?.classList.contains('m3-icon-morph')).toBe(false);
    expect(title?.classList.contains('m3-text-morph')).toBe(false);
    expect(description?.classList.contains('m3-text-morph')).toBe(false);

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

it('defaults to standard and opts into expressive morphs without changing semantics', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const app = createApp(() =>
    h('div', [h(ListItem, { title: 'Standard' }), h(ListItem, { title: 'Expressive', appearance: 'expressive' })]),
  );
  app.mount(container);
  await nextTick();
  const items = container.querySelectorAll<HTMLElement>('[data-scope="item"][data-part="root"]');
  expect(items[0]?.dataset.appearance).toBe('standard');
  expect(items[0]?.querySelector('.m3-text-morph')).toBeNull();
  expect(items[1]?.dataset.appearance).toBe('expressive');
  expect(items[1]?.querySelector('.m3-text-morph')).not.toBeNull();
  expect([...items].map((item) => item.tagName)).toEqual(['BUTTON', 'BUTTON']);
  app.unmount();
});

it('inherits row sizes per field without inheriting Button size defaults', async () => {
  const applicationSize = ref<ListItemSize>('small');
  const subtreeSize = ref<ListItemSize>();
  const instanceSize = ref<ListItemSize>();
  const Child = defineComponent({
    setup() {
      provideListItemDefaults({ appearance: 'expressive' });
      return () => h(ListItem, { size: instanceSize.value, title: 'Row' });
    },
  });
  const Root = defineComponent({
    setup() {
      provideListItemDefaults({ size: subtreeSize });
      return () => h(Child);
    },
  });
  const app = createApp(Root);
  app.use(M3VuePlugin, { listItemDefaults: { size: applicationSize }, buttonDefaults: { size: 'extra-large' } });
  const container = document.createElement('div');
  app.mount(container);
  const root = container.querySelector<HTMLElement>('[data-scope="item"]')!;
  try {
    expect(root.dataset.size).toBe('small');
    expect(root.dataset.appearance).toBe('expressive');
    subtreeSize.value = 'large';
    await nextTick();
    expect(root.dataset.size).toBe('large');
    instanceSize.value = 'extra-small';
    await nextTick();
    expect(root.dataset.size).toBe('extra-small');
    instanceSize.value = undefined;
    await nextTick();
    expect(root.dataset.size).toBe('large');
    subtreeSize.value = undefined;
    applicationSize.value = 'medium';
    await nextTick();
    expect(root.dataset.size).toBe('medium');
  } finally {
    app.unmount();
  }
});
