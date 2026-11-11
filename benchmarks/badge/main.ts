import { Badge, Tab, TabList, Tabs } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const host = document.getElementById('fixture')!;
const inTabs = new URLSearchParams(location.search).get('variant') === 'tabs';
const step = ref(0);
let app: App | undefined;

const renderBadge = (index: number, value: number) =>
  h(
    Badge,
    {
      key: index,
      variant: index % 5 === 4 ? 'small' : 'large',
      content: (value + index) % 2 ? 120 : 8,
      max: index % 6 === 5 ? -1 : 99,
      hidden: index % 9 === 8 && value % 2 === 1,
      ariaLabel: index % 7 === 6 ? 'Unread' : undefined,
    },
    index % 8 === 7 ? { default: () => 'New' } : undefined,
  );

window.componentLifecycleBenchmark = {
  async mount(count) {
    step.value = 0;
    app = createApp({
      render() {
        const value = step.value;
        if (inTabs) {
          return h(
            Tabs,
            { variant: 'line', mode: 'scrollable', modelValue: '0' },
            {
              default: () =>
                h(TabList, null, {
                  default: () =>
                    Array.from({ length: count }, (_, index) =>
                      h(
                        Tab,
                        {
                          key: index,
                          value: String(index),
                        },
                        { default: () => ['Tab ' + index, renderBadge(index, value)] },
                      ),
                    ),
                }),
            },
          );
        }

        return h(
          'div',
          { class: 'badges' },
          Array.from({ length: count }, (_, index) => renderBadge(index, value)),
        );
      },
    });
    app.mount(host);
    await nextTick();
  },
  async set(value) {
    step.value = value;
    await nextTick();
  },
  unmount() {
    app!.unmount();
    app = undefined;
  },
  frame: () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
};
