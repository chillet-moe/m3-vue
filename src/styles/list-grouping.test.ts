// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, defineComponent, h, nextTick } from 'vue';
import ListItem from '../components/ListItem/ListItem.vue';

const groupingStyles = readFileSync('src/styles/list-grouping.css', 'utf8');
const listItemStyles = readFileSync('src/components/ListItem/ListItem.css', 'utf8');
const themeStyles = readFileSync('src/styles/theme.css', 'utf8');

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

  it('owns the public tokens and participant root shape contract globally', () => {
    expect(themeStyles).toContain("@import './list-grouping.css';");
    expect(groupingStyles).toContain('--md-list-group-item-shape: initial');
    expect(groupingStyles).toContain(
      '--_list-group-item-rounded-shape: var(--md-list-group-item-shape, var(--md-sys-shape-corner-small));',
    );
    expect(groupingStyles).toContain(
      '--_list-group-item-square-shape: var(--md-list-group-item-shape, var(--md-shape-compact));',
    );
    expect(groupingStyles).toContain("> [data-list-group-item][data-shape='rounded'] {");
    expect(groupingStyles).toContain("[data-shape='square']:nth-child(1 of [data-list-group-item])");
    expect(groupingStyles).toContain("[data-shape='square']:nth-last-child(1 of [data-list-group-item])");
    expect(groupingStyles).toContain('border-start-start-radius: var(--_list-group-item-rounded-shape)');
    expect(groupingStyles).not.toContain("[data-scope='item']");
    expect(groupingStyles).not.toContain('m3-item');
  });

  it('leaves only the active indicator adapter with ListItem', () => {
    expect(listItemStyles).not.toContain('--md-list-group-item-shape: initial');
    expect(listItemStyles).not.toContain('border-start-start-radius: var(--_list-group-item-rounded-shape)');
    expect(listItemStyles).toContain(
      "> [data-list-group-item][data-scope='item'][data-part='root'][data-shape='rounded']",
    );
    expect(listItemStyles).toContain('--md-item-indicator-shape: var(--_list-group-item-rounded-shape)');
    expect(listItemStyles).toContain('--md-item-indicator-shape: var(--_list-group-item-first-child-shape)');
  });
});
