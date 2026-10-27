// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import {
  Menu,
  MenuItem,
  MenuSubMenu,
  TreeView,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerSection,
  NavigationRail,
  NavigationRailItem,
  M3VuePlugin,
  provideRowSize,
  type RowSize,
} from '@/index';

it('resolves reactive application, subtree, container and item row sizes', async () => {
  const globalSize = ref<RowSize>('small');
  const localSize = ref<RowSize>();
  const menuSize = ref<RowSize>();
  const Region = defineComponent({
    setup() {
      provideRowSize(localSize);
      return () =>
        h('section', [
          h(Menu, { id: 'menu', size: menuSize.value }, () => [
            h(MenuItem, { id: 'item' }, () => 'Item'),
            h(MenuItem, { id: 'explicit', size: 'large' }, () => 'Override'),
            h(
              MenuSubMenu,
              { size: 'extra-small' },
              {
                trigger: () => h(MenuItem, { id: 'trigger' }, () => 'Branch'),
                default: () => h(MenuItem, { id: 'nested' }, () => 'Nested'),
              },
            ),
          ]),
          h(TreeView, { id: 'tree', items: [{ value: 'one', label: 'One' }] }),
          h(NavigationDrawer, { id: 'drawer' }, () => [
            h(NavigationDrawerItem, { id: 'destination', label: 'Home' }),
            h(NavigationDrawerSection, { size: 'extra-large' }, () =>
              h(NavigationDrawerItem, { id: 'section-child', label: 'Child' }),
            ),
          ]),
          h(NavigationRail, { id: 'rail' }, () => h(NavigationRailItem, { id: 'rail-item', label: 'Home' })),
        ]);
    },
  });
  const host = document.createElement('div');
  document.body.append(host);
  const app = createApp(Region);
  app.use(M3VuePlugin, { rowSize: globalSize });
  app.mount(host);
  const size = (selector: string) => host.querySelector(selector)?.getAttribute('data-size');
  try {
    expect(size('#item')).toBe('small');
    expect(size('#tree [data-scope="tree-item"][data-part="root"]')).toBe('small');
    expect(size('#destination')).toBe('small');
    expect(size('#rail-item')).toBe('small');
    expect(size('#explicit')).toBe('large');
    expect(size('#trigger')).toBe('extra-small');
    expect(size('#nested')).toBe('extra-small');
    expect(size('#section-child')).toBe('extra-large');
    globalSize.value = 'large';
    await nextTick();
    expect(size('#item')).toBe('large');
    expect(size('#rail-item')).toBe('large');
    localSize.value = 'extra-small';
    menuSize.value = 'medium';
    await nextTick();
    expect(size('#item')).toBe('medium');
    expect(size('#destination')).toBe('extra-small');
    expect(size('#tree [data-scope="tree-item"][data-part="root"]')).toBe('extra-small');
    menuSize.value = undefined;
    localSize.value = undefined;
    await nextTick();
    expect(size('#item')).toBe('large');
    expect(size('#nested')).toBe('extra-small');
  } finally {
    app.unmount();
    host.remove();
  }
});
