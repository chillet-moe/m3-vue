// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Tab from './Tab.vue';
import TabList from './TabList.vue';
import TabPanel from './TabPanel.vue';
import Tabs from './Tabs.vue';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
  it('exposes line divider options on the Tabs root', async () => {
    const mounted = mountTabs({}, 'overview', {
      variant: 'line',
      divider: true,
      dividerFullWidth: true,
    });
    await nextTick();

    const root = mounted.container.querySelector<HTMLElement>('[data-scope="tabs"][data-part="root"]');

    expect(root?.dataset.divider).toBe('true');
    expect(root?.dataset.dividerFullWidth).toBe('true');

    mounted.app.unmount();
  });

  it('omits line divider attributes by default', async () => {
    const mounted = mountTabs({}, 'overview', {
      variant: 'line',
      dividerFullWidth: true,
    });
    await nextTick();

    const root = mounted.container.querySelector<HTMLElement>('[data-scope="tabs"][data-part="root"]');

    expect(root?.hasAttribute('data-divider')).toBe(false);
    expect(root?.hasAttribute('data-divider-full-width')).toBe(false);

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

  it('updates the scoped slot and keeps a changed tab value linked to its panel', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const selected = ref('overview');
    const otherValue = ref('details');
    const app = createApp(() =>
      h(
        Tabs,
        {
          modelValue: selected.value,
          'onUpdate:modelValue': (value: string | undefined) => {
            if (value !== undefined) selected.value = value;
          },
        },
        {
          default: ({ value }: { value?: string }) => [
            h(TabList, null, {
              default: () => [h(Tab, { value: 'overview' }), h(Tab, { value: otherValue.value })],
            }),
            h(TabPanel, { value: otherValue.value }),
            h('output', value),
          ],
        },
      ),
    );
    app.mount(container);

    const trigger = container.querySelector<HTMLButtonElement>('[data-tab-value="details"]')!;
    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]')!;
    expect(panel.hidden).toBe(true);

    otherValue.value = 'new details';
    await nextTick();
    expect(trigger.dataset.tabValue).toBe('new details');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);

    trigger.click();
    await nextTick();
    expect(container.querySelector('output')?.textContent).toBe('new details');
    expect(trigger.getAttribute('aria-selected')).toBe('true');
    expect(panel.hidden).toBe(false);
    app.unmount();
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

  it('observes line indicator geometry only while the line variant is active', async () => {
    const resizeCallbacks: ResizeObserverCallback[] = [];
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    const ResizeObserver = vi.fn(
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallbacks.push(callback);
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = disconnect;
      },
    );
    vi.stubGlobal('ResizeObserver', ResizeObserver);
    const addWindowEventListener = vi.spyOn(window, 'addEventListener');
    const currentValue = ref('tab-0');
    const orientation = ref<'horizontal' | 'vertical'>('horizontal');
    const variant = ref<'navigation' | 'line'>('navigation');
    const tabCount = ref(3);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const app = createApp({
      render: () =>
        h(
          Tabs,
          {
            modelValue: currentValue.value,
            orientation: orientation.value,
            variant: variant.value,
            'onUpdate:modelValue': (value: string | undefined) => {
              if (value !== undefined) currentValue.value = value;
            },
          },
          {
            default: () =>
              h(TabList, null, {
                default: () =>
                  Array.from({ length: tabCount.value }, (_, index) => {
                    const tab = h(Tab, { value: `tab-${index}` }, { default: () => `Tab ${index}` });
                    return index === 3 ? h('div', [tab]) : tab;
                  }),
              }),
          },
        ),
    });

    app.mount(container);
    await nextTick();

    expect(ResizeObserver).not.toHaveBeenCalled();
    expect(addWindowEventListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(0);

    variant.value = 'line';
    await nextTick();
    expect(ResizeObserver).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(4);
    expect(addWindowEventListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(0);
    expect(resizeCallbacks).toHaveLength(1);

    currentValue.value = 'tab-2';
    await nextTick();
    await nextTick();
    orientation.value = 'vertical';
    await nextTick();
    await nextTick();

    expect(ResizeObserver).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(4);
    expect(disconnect).not.toHaveBeenCalled();

    tabCount.value = 4;
    await nextTick();
    const addedTab = container.querySelector('[data-tab-value="tab-3"]')!;

    expect(ResizeObserver).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(5);
    expect(observe).toHaveBeenLastCalledWith(addedTab);
    expect(unobserve).not.toHaveBeenCalled();

    const removedTabs = [container.querySelector('[data-tab-value="tab-2"]')!, addedTab];
    tabCount.value = 2;
    await nextTick();

    expect(unobserve).toHaveBeenCalledTimes(2);
    expect(unobserve.mock.calls).toEqual(removedTabs.map((tab) => [tab]));

    const changedRole = container.querySelector('[data-tab-value="tab-1"]')!;
    changedRole.removeAttribute('role');
    await nextTick();
    expect(unobserve).toHaveBeenLastCalledWith(changedRole);

    changedRole.setAttribute('role', 'tab');
    await nextTick();
    expect(observe).toHaveBeenLastCalledWith(changedRole);

    variant.value = 'navigation';
    await nextTick();
    expect(disconnect).toHaveBeenCalledTimes(1);

    currentValue.value = 'tab-1';
    await nextTick();
    const active = container.querySelector<HTMLElement>('[data-tab-value="tab-1"]')!;
    let top = 48;
    let height = 40;
    Object.defineProperties(active, { offsetTop: { get: () => top }, offsetHeight: { get: () => height } });

    variant.value = 'line';
    await nextTick();
    const indicator = container.querySelector<HTMLElement>('[data-part="indicator"]')!;
    expect(indicator.style.getPropertyValue('--_tabs-indicator-block-start')).toBe('48px');
    expect(indicator.style.getPropertyValue('--_tabs-indicator-block-size')).toBe('40px');
    expect(ResizeObserver).toHaveBeenCalledTimes(2);

    top = 60;
    height = 48;
    resizeCallbacks.at(-1)?.([], {} as ResizeObserver);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    await nextTick();
    expect(indicator.style.getPropertyValue('--_tabs-indicator-block-start')).toBe('60px');
    expect(indicator.style.getPropertyValue('--_tabs-indicator-block-size')).toBe('48px');

    app.unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it('uses window resize only when ResizeObserver is unavailable', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const addWindowEventListener = vi.spyOn(window, 'addEventListener');
    const removeWindowEventListener = vi.spyOn(window, 'removeEventListener');
    const mounted = mountTabs({}, 'overview', { variant: 'line' });
    await nextTick();
    await nextTick();

    expect(addWindowEventListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(1);

    mounted.app.unmount();
    expect(removeWindowEventListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(1);
  });

  it('measures the selected Tab and clears the indicator when no Tab is selected', async () => {
    const mounted = mountTabs({}, 'overview', { variant: 'line', orientation: 'vertical' });
    await nextTick();
    mounted.container.querySelectorAll('[role="tab"]').forEach((trigger, index) => {
      Object.defineProperties(trigger, { offsetTop: { value: index * 48 }, offsetHeight: { value: 48 } });
    });
    mounted.currentValue.value = 'details';
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    await nextTick();

    const indicator = mounted.container.querySelector<HTMLElement>('[data-part="indicator"]')!;
    expect(indicator.style.getPropertyValue('--_tabs-indicator-block-start')).toBe('48px');
    expect(indicator.style.getPropertyValue('--_tabs-indicator-block-size')).toBe('48px');

    mounted.currentValue.value = 'missing';
    await nextTick();
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    await nextTick();
    expect(indicator.style.getPropertyValue('--_tabs-indicator-block-size')).toBe('');
    mounted.app.unmount();
  });
});
