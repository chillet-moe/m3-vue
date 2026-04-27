// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import Tab from './Tab.vue';
import TabList from './TabList.vue';
import TabPanel from './TabPanel.vue';
import Tabs from './Tabs.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

function mountTabs(tabProps: Record<string, unknown>, initialValue = 'overview') {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const updates: string[] = [];
  const currentValue = ref(initialValue);

  const app = createApp({
    setup() {
      return () =>
        h(
          Tabs,
          {
            modelValue: currentValue.value,
            'onUpdate:modelValue': (value: string | undefined) => {
              if (value === undefined) {
                return;
              }

              updates.push(value);
              currentValue.value = value;
            },
          },
          {
            default: () => [
              h(TabList, undefined, {
                default: () => [
                  h(Tab, { value: 'overview' }, { default: () => 'Overview' }),
                  h(Tab, { value: 'details', ...tabProps }, { default: () => 'Details' }),
                ],
              }),
              h(TabPanel, { value: 'overview' }, { default: () => 'Overview panel' }),
              h(TabPanel, { value: 'details' }, { default: () => 'Details panel' }),
            ],
          },
        );
    },
  });

  app.mount(container);

  return {
    app,
    container,
    updates,
    currentValue,
  };
}

describe('Tab', () => {
  it('renders as an anchor when href is provided', async () => {
    const mounted = mountTabs({ href: '/settings/details' });
    await nextTick();

    const trigger = mounted.container.querySelector<HTMLElement>('[data-scope="tabs"][data-part="trigger"][href]');

    expect(trigger?.tagName).toBe('A');
    expect(trigger?.getAttribute('href')).toBe('/settings/details');

    mounted.app.unmount();
  });

  it('blocks disabled anchor interaction and removes href', async () => {
    const mounted = mountTabs({ href: '/settings/details', disabled: true });
    await nextTick();

    const trigger = mounted.container.querySelector<HTMLElement>('[data-tab-value="details"]');

    expect(trigger?.tagName).toBe('A');
    expect(trigger?.getAttribute('href')).toBeNull();
    expect(trigger?.getAttribute('aria-disabled')).toBe('true');
    expect(trigger?.getAttribute('tabindex')).toBe('-1');

    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(mounted.currentValue.value).toBe('overview');
    expect(mounted.updates).toEqual([]);

    mounted.app.unmount();
  });

  it('activates anchor tabs on space key', async () => {
    const mounted = mountTabs({ href: '/settings/details' });
    await nextTick();

    const trigger = mounted.container.querySelector<HTMLElement>('[data-tab-value="details"]');

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await nextTick();

    expect(mounted.currentValue.value).toBe('details');
    expect(mounted.updates).toEqual(['details']);

    mounted.app.unmount();
  });
});
