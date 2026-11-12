// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick } from 'vue';
import ListItem from '../components/ListItem/ListItem.vue';

const UserOwnedList = defineComponent({
  name: 'UserOwnedList',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('section', attrs, slots.default?.());
  },
});

const UserOwnedRow = defineComponent({
  name: 'UserOwnedRow',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('article', attrs, slots.default?.());
  },
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('List grouping utility', () => {
  it('composes ListItem and user-owned participants without a library wrapper', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        UserOwnedList,
        {
          class: 'settings-list',
          'data-scope': 'list',
          'data-part': 'container',
          'aria-label': 'Settings',
        },
        {
          default: () => [
            h('h2', { id: 'heading' }, 'Settings'),
            h(ListItem, { title: 'Account' }),
            h('hr', { id: 'divider' }),
            h(
              UserOwnedRow,
              { id: 'status', 'data-list-group-item': '', 'data-shape': 'rounded' },
              { default: () => 'System status' },
            ),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="list"][data-part="container"]');
    const directParticipants = root?.querySelectorAll(':scope > [data-list-group-item]');

    expect(root?.tagName).toBe('SECTION');
    expect(root?.classList.contains('settings-list')).toBe(true);
    expect(root?.getAttribute('aria-label')).toBe('Settings');
    expect(directParticipants).toHaveLength(2);
    expect(root?.querySelector('#status')?.getAttribute('data-shape')).toBe('rounded');
    expect(root?.children[0]?.id).toBe('heading');
    expect(root?.children[2]?.id).toBe('divider');

    app.unmount();
  });

  it('keeps nested grouping boundaries independent', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', { 'data-scope': 'list', 'data-part': 'container' }, [
        h(ListItem, { title: 'Outer first' }),
        h('div', { 'data-scope': 'list', 'data-part': 'container' }, [h(ListItem, { title: 'Nested item' })]),
        h(ListItem, { title: 'Outer last' }),
      ]),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="list"][data-part="container"]');
    const directParticipants = root?.querySelectorAll(':scope > [data-list-group-item]');

    expect(directParticipants).toHaveLength(2);
    expect(container.querySelectorAll('[data-scope="list"][data-part="container"]')).toHaveLength(2);

    app.unmount();
  });
});
