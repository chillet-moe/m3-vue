import { Divider } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const host = document.querySelector('main')!;
const custom = new URLSearchParams(location.search).get('variant') === 'custom';
const step = ref(0);
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount(count) {
    step.value = 0;
    app = createApp(() => {
      const vertical = step.value % 2 === 1;
      return h(
        'section',
        { class: 'dividers' },
        Array.from({ length: count }, (_, index) =>
          h(Divider, {
            key: index,
            orientation: vertical ? 'vertical' : 'horizontal',
            inset: vertical ? 'both' : 'none',
            thickness: custom ? (vertical ? '0.1875rem' : '2px') : undefined,
            spacing: custom && vertical ? '4px' : undefined,
          }),
        ),
      );
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
