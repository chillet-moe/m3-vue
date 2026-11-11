import { Button } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../../componentLifecycle';

const titled = new URLSearchParams(location.search).get('variant') === 'titled';
const host = document.querySelector('main')!;
const revision = ref(0);
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount(count) {
    revision.value = 0;
    app = createApp(() => {
      const current = revision.value;
      return Array.from({ length: count }, (_, index) => {
        return h(
          Button,
          {
            key: index,
            'data-action': index,
            'data-revision': current,
            ...(titled && { title: `Help ${index}` }),
          },
          () => `Action ${index + current}`,
        );
      });
    });
    app.mount(host);
    await nextTick();
  },
  async set(step) {
    revision.value = step % 2;
    await nextTick();
  },
  unmount() {
    app!.unmount();
    app = undefined;
  },
  frame: () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
};
