// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick, ref } from 'vue';
import NavigationRailItem from './NavigationRailItem.vue';
import NavigationRail from './NavigationRail.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

function mountRail(initialValue = 'home', initialState: 'collapsed' | 'expanded' = 'collapsed') {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const updates: string[] = [];
  const currentValue = ref(initialValue);
  const currentState = ref<'collapsed' | 'expanded'>(initialState);

  const app = createApp({
    setup() {
      return () =>
        h(
          NavigationRail,
          {
            modelValue: currentValue.value,
            state: currentState.value,
            'onUpdate:modelValue': (value: string | undefined) => {
              if (value === undefined) {
                return;
              }

              updates.push(value);
              currentValue.value = value;
            },
            'onUpdate:state': (state: 'collapsed' | 'expanded') => {
              currentState.value = state;
            },
          },
          {
            default: () => [
              h(NavigationRailItem, { value: 'home', icon: 'home', label: 'Home' }),
              h(NavigationRailItem, { value: 'search', icon: 'search', label: 'Search' }),
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
    currentState,
    updates,
  };
}

describe('NavigationRail', () => {
  it('updates the selected value when item is clicked', async () => {
    const mounted = mountRail();
    await nextTick();

    const target = mounted.container.querySelector<HTMLElement>('[data-item-value="search"]');
    target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(mounted.currentValue.value).toBe('search');
    expect(mounted.updates).toEqual(['search']);
    expect(target?.dataset.selected).toBe('true');

    mounted.app.unmount();
  });

  it('propagates collapsed/expanded state to rail and items', async () => {
    const mounted = mountRail('home', 'collapsed');
    await nextTick();

    const rail = mounted.container.querySelector<HTMLElement>('[data-scope="navigation-rail"][data-part="root"]');
    const item = mounted.container.querySelector<HTMLElement>('[data-scope="navigation-rail-item"][data-part="root"]');
    const expandedLabel = item?.querySelector<HTMLElement>('.m3-navigation-rail-item-label-expanded');
    const collapsedLabel = item?.querySelector<HTMLElement>('.m3-navigation-rail-item-label-collapsed');

    expect(rail?.dataset.state).toBe('collapsed');
    expect(item?.dataset.state).toBe('collapsed');
    expect(expandedLabel?.getAttribute('aria-hidden')).toBe('true');
    expect(collapsedLabel?.getAttribute('aria-hidden')).toBeNull();

    mounted.currentState.value = 'expanded';
    await nextTick();

    expect(rail?.dataset.state).toBe('expanded');
    expect(item?.dataset.state).toBe('expanded');
    expect(expandedLabel?.getAttribute('aria-hidden')).toBeNull();
    expect(collapsedLabel?.getAttribute('aria-hidden')).toBe('true');

    mounted.app.unmount();
  });
});

describe('NavigationRailItem', () => {
  it('renders disabled href items as non-interactive anchor state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() =>
      h(NavigationRailItem, { href: '/settings', icon: 'settings', label: 'Settings', disabled: true }),
    );
    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="navigation-rail-item"][data-part="root"]');

    expect(root?.tagName).toBe('A');
    expect(root?.getAttribute('href')).toBeNull();
    expect(root?.getAttribute('aria-disabled')).toBe('true');
    expect(root?.getAttribute('tabindex')).toBe('-1');

    app.unmount();
  });

  it('supports explicit selected state outside NavigationRail', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(NavigationRailItem, { icon: 'home', label: 'Home', selected: true }));
    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('[data-scope="navigation-rail-item"][data-part="root"]');

    expect(root?.dataset.selected).toBe('true');
    expect(root?.getAttribute('aria-current')).toBe('page');

    app.unmount();
  });
});
