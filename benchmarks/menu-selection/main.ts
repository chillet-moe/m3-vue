import { Menu, MenuContainer, MenuItem } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const host = document.querySelector('main')!;
const model = ref<number[]>([]);
let initial: number[] = [];
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount(count) {
    const values = Array.from({ length: count }, (_, value) => value);
    initial = values.filter((value) => value % 2 === 1);
    model.value = initial;
    app = createApp(() =>
      h(
        Menu,
        { open: true, multiple: true, modelValue: model.value },
        {
          default: () =>
            h(MenuContainer, null, {
              default: () =>
                values.map((value) =>
                  h(
                    MenuItem,
                    { key: value, value, 'data-menu-bench-row': value },
                    {
                      default: ({ checked, selected }: { checked: boolean; selected: boolean }) =>
                        h('span', { 'data-checked': checked, 'data-selected': selected }, `Menu item ${value + 1}`),
                    },
                  ),
                ),
            }),
        },
      ),
    );
    app.mount(host);
    await nextTick();
  },
  async set(step) {
    model.value = step % 2 ? [...initial, 2] : initial;
    await nextTick();
  },
  unmount() {
    app!.unmount();
    app = undefined;
  },
  frame: () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
};
