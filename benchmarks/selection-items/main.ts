import { ButtonGroup, ButtonGroupItem, Chip, ChipGroup } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const host = document.querySelector('main')!;
const buttons = new URLSearchParams(location.search).get('variant') === 'button';
const step = ref(0);
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount(count) {
    step.value = 0;
    app = createApp(() => {
      const multiple = step.value % 2 === 0;
      const group = {
        name: multiple ? 'initial' : 'updated',
        selectionMode: multiple ? ('multiple' as const) : ('single' as const),
        modelValue: multiple ? [0] : 1,
      };
      const items = {
        default: () =>
          Array.from({ length: count }, (_, index) => {
            const value = multiple ? index : index + 1;
            const label = () => `Option ${index + 1}`;
            return buttons ? h(ButtonGroupItem, { key: index, value }, label) : h(Chip, { key: index, value }, label);
          }),
      };
      return buttons ? h(ButtonGroup, { ...group, type: 'connected' }, items) : h(ChipGroup, group, items);
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
