// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, defineComponent, h, nextTick } from 'vue';
import ListItem from './ListItem.vue';

const listItemStyles = readFileSync('src/components/ListItem/ListItem.css', 'utf8');

const UserOwnedList = defineComponent({
  name: 'UserOwnedList',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('section', attrs, slots.default?.());
  },
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ListItem grouping contract', () => {
  it('can be composed into a user-owned component without adding a library wrapper', async () => {
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
            h(ListItem, { title: 'Privacy' }),
          ],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="list"][data-part="container"]');
    const directItems = root?.querySelectorAll(':scope > [data-scope="item"][data-part="root"]');

    expect(root?.tagName).toBe('SECTION');
    expect(root?.classList.contains('settings-list')).toBe(true);
    expect(root?.getAttribute('aria-label')).toBe('Settings');
    expect(root?.classList.contains('m3-list-container')).toBe(false);
    expect(directItems).toHaveLength(2);
    expect(root?.children[0]?.id).toBe('heading');
    expect(root?.children[2]?.id).toBe('divider');

    app.unmount();
  });

  it('keeps nested grouping boundaries and ignores non-item children for first and last matching', async () => {
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
    const directItems = root?.querySelectorAll(':scope > [data-scope="item"][data-part="root"]');

    expect(directItems).toHaveLength(2);
    expect(container.querySelectorAll('[data-scope="list"][data-part="container"]')).toHaveLength(2);

    app.unmount();
  });

  it('keeps grouping styles on public markers and leaves layout to the owner', () => {
    expect(listItemStyles).toContain('--md-list-group-item-shape: initial');
    expect(listItemStyles).toContain(
      '--_list-group-item-rounded-shape: var(--md-list-group-item-shape, var(--md-sys-shape-corner-small));',
    );
    expect(listItemStyles).toContain(
      '--_list-group-item-square-shape: var(--md-list-group-item-shape, var(--md-shape-compact));',
    );
    expect(listItemStyles).toContain("[data-shape='square']:not(");
    expect(listItemStyles).toContain("[data-shape='square']:nth-child(");
    expect(listItemStyles).toContain("[data-shape='square']:nth-last-child(");
    expect(listItemStyles).toContain('--md-item-indicator-shape: var(--_button-container-shape)');
    expect(listItemStyles).toContain("[data-scope='list'][data-part='container']");
    expect(listItemStyles).toContain("> [data-scope='item'][data-part='root'][data-shape='rounded'] {");
    expect(listItemStyles).not.toContain("[data-shape='rounded'][data-pressed='false']");
    expect(listItemStyles).toContain("1 of [data-scope='item'][data-part='root'][data-shape='rounded']");
    expect(listItemStyles).toContain('border-start-start-radius: var(--_list-group-item-rounded-shape)');
    expect(listItemStyles).toContain('--md-item-indicator-shape: var(--_list-group-item-rounded-shape)');
    expect(listItemStyles).toContain('--md-item-indicator-shape: var(--_list-group-item-first-child-shape)');
    expect(listItemStyles).toContain(
      '--md-item-indicator-shape: var(--_list-group-item-rounded-shape) var(--_list-group-item-rounded-shape)',
    );
    expect(listItemStyles).not.toContain('m3-list-container');
  });

  it('keeps square items out of the rounded grouping contract', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h('div', { 'data-scope': 'list', 'data-part': 'container' }, [
        h(ListItem, { title: 'Square item', shape: 'square', active: true }),
      ]),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="item"][data-part="root"]');

    expect(root?.dataset.shape).toBe('square');
    expect(root?.dataset.active).toBe('true');

    app.unmount();
  });
});
