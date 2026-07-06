// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import NavigationDrawerItem from './NavigationDrawerItem.vue';
import NavigationDrawerSection from './NavigationDrawerSection.vue';
import NavigationDrawer from './NavigationDrawer.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

function mountDrawer(initialValue = 'home') {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const updates: string[] = [];
  const currentValue = ref(initialValue);

  const app = createApp({
    setup() {
      return () =>
        h(
          NavigationDrawer,
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
              h(NavigationDrawerItem, { value: 'home', icon: 'home', label: 'Home' }),
              h(
                NavigationDrawerSection,
                { icon: 'folder', label: 'Projects' },
                {
                  default: () => [
                    h(NavigationDrawerItem, { value: 'active', icon: 'task_alt', label: 'Active' }),
                    h(NavigationDrawerItem, { value: 'archived', icon: 'archive', label: 'Archived' }),
                  ],
                },
              ),
            ],
          },
        );
    },
  });

  app.mount(container);

  return {
    app,
    container,
    currentValue,
    updates,
  };
}

describe('NavigationDrawer', () => {
  it('updates the selected value when item is clicked', async () => {
    const mounted = mountDrawer();
    await nextTick();

    const target = mounted.container.querySelector<HTMLElement>('[data-item-value="active"]');
    target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(mounted.currentValue.value).toBe('active');
    expect(mounted.updates).toEqual(['active']);
    expect(target?.dataset.selected).toBe('true');
    expect(target?.classList.contains('m3-morph-host')).toBe(true);

    mounted.app.unmount();
  });

  it('toggles expandable sections', async () => {
    const mounted = mountDrawer();
    await nextTick();

    const section = mounted.container.querySelector<HTMLElement>('[data-scope="navigation-drawer-section"]');
    const trigger = mounted.container.querySelector<HTMLButtonElement>('[data-part="trigger"]');
    const content = mounted.container.querySelector<HTMLElement>('[data-part="content"]');

    expect(section?.dataset.expanded).toBeUndefined();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(content?.getAttribute('aria-hidden')).toBe('true');

    trigger?.click();
    await nextTick();

    expect(section?.dataset.expanded).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(content?.getAttribute('aria-hidden')).toBeNull();

    mounted.app.unmount();
  });

  it('exposes explicit icon space state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(
        NavigationDrawer,
        { iconSpace: 'root' },
        {
          default: () => [h(NavigationDrawerItem, { value: 'home', label: 'Home' })],
        },
      ),
    );

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="navigation-drawer"][data-part="root"]');

    expect(root?.dataset.iconSpace).toBe('root');

    app.unmount();
  });

  it('prevents disabled drawer items from activating', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const currentValue = ref('home');
    const app = createApp({
      setup() {
        return () =>
          h(
            NavigationDrawer,
            {
              modelValue: currentValue.value,
              disabled: true,
              'onUpdate:modelValue': (value: string | undefined) => {
                if (value !== undefined) {
                  currentValue.value = value;
                }
              },
            },
            {
              default: () => [h(NavigationDrawerItem, { value: 'settings', icon: 'settings', label: 'Settings' })],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const target = container.querySelector<HTMLElement>('[data-item-value="settings"]');
    target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(currentValue.value).toBe('home');
    expect(target?.dataset.disabled).toBe('true');

    app.unmount();
  });

  it('propagates disabled section state to nested items', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const currentValue = ref('home');
    const app = createApp({
      setup() {
        return () =>
          h(
            NavigationDrawer,
            {
              modelValue: currentValue.value,
              'onUpdate:modelValue': (value: string | undefined) => {
                if (value !== undefined) {
                  currentValue.value = value;
                }
              },
            },
            {
              default: () => [
                h(
                  NavigationDrawerSection,
                  { label: 'Projects', disabled: true, expanded: true },
                  {
                    default: () => [h(NavigationDrawerItem, { value: 'active', icon: 'task_alt', label: 'Active' })],
                  },
                ),
              ],
            },
          );
      },
    });

    app.mount(container);
    await nextTick();

    const target = container.querySelector<HTMLElement>('[data-item-value="active"]');
    target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(currentValue.value).toBe('home');
    expect(target?.dataset.disabled).toBe('true');

    app.unmount();
  });
});

describe('NavigationDrawerItem', () => {
  it('renders disabled href items as non-interactive anchor state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(NavigationDrawerItem, { href: '/settings', icon: 'settings', label: 'Settings', disabled: true }),
    );
    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="navigation-drawer-item"][data-part="root"]');

    expect(root?.tagName).toBe('A');
    expect(root?.getAttribute('href')).toBeNull();
    expect(root?.getAttribute('aria-disabled')).toBe('true');
    expect(root?.getAttribute('tabindex')).toBe('-1');

    app.unmount();
  });
});
