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

function mountTabs(
  tabProps: Record<string, unknown>,
  initialValue = 'overview',
  tabsProps: Record<string, unknown> = {},
) {
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
            ...tabsProps,
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
  it('uses navigation tabs by default', async () => {
    const mounted = mountTabs({});
    await nextTick();

    const root = mounted.container.querySelector<HTMLElement>('[data-scope="tabs"][data-part="root"]');

    expect(root?.dataset.variant).toBe('navigation');
    expect(root?.dataset.size).toBe('medium');
    expect(root?.dataset.mode).toBe('auto');

    mounted.app.unmount();
  });

  it('applies the line variant attribute', async () => {
    const mounted = mountTabs({}, 'overview', { variant: 'line', size: 'extra-large' });
    await nextTick();

    const root = mounted.container.querySelector<HTMLElement>('[data-scope="tabs"][data-part="root"]');

    expect(root?.dataset.variant).toBe('line');
    expect(root?.dataset.size).toBe('extra-large');

    mounted.app.unmount();
  });

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

  it('blocks disabled button interaction', async () => {
    const mounted = mountTabs({ disabled: true });
    await nextTick();

    const trigger = mounted.container.querySelector<HTMLButtonElement>('[data-tab-value="details"]');

    expect(trigger?.tagName).toBe('BUTTON');
    expect(trigger?.disabled).toBe(true);
    expect(trigger?.dataset.disabled).toBe('true');

    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(mounted.currentValue.value).toBe('overview');
    expect(mounted.updates).toEqual([]);

    mounted.app.unmount();
  });

  it('skips disabled tabs during keyboard navigation', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const updates: string[] = [];
    const currentValue = ref('overview');

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
                    h(Tab, { value: 'details', disabled: true }, { default: () => 'Details' }),
                    h(Tab, { value: 'settings' }, { default: () => 'Settings' }),
                  ],
                }),
                h(TabPanel, { value: 'overview' }, { default: () => 'Overview panel' }),
                h(TabPanel, { value: 'details' }, { default: () => 'Details panel' }),
                h(TabPanel, { value: 'settings' }, { default: () => 'Settings panel' }),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const overviewTrigger = container.querySelector<HTMLElement>('[data-tab-value="overview"]');
    const disabledTrigger = container.querySelector<HTMLElement>('[data-tab-value="details"]');
    const settingsTrigger = container.querySelector<HTMLElement>('[data-tab-value="settings"]');

    expect(overviewTrigger).not.toBeNull();
    expect(overviewTrigger?.parentElement?.dataset.part).toBe('list');
    expect(overviewTrigger?.parentElement?.getAttribute('role')).toBe('tablist');
    expect(disabledTrigger?.dataset.disabled).toBe('true');
    expect(settingsTrigger?.hasAttribute('data-disabled')).toBe(false);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    overviewTrigger?.dispatchEvent(event);
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement?.getAttribute('data-tab-value')).toBe('settings');
    expect(currentValue.value).toBe('settings');
    expect(updates).toEqual(['settings']);

    app.unmount();
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
