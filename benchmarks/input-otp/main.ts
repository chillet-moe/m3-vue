import { InputOtp } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const host = document.querySelector('main')!;
const value = ref('8 xx 42');
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount(count) {
    value.value = '8 xx 42';
    app = createApp(() =>
      Array.from({ length: count }, (_, index) =>
        h(InputOtp, { key: index, name: `code-${index}`, modelValue: value.value }),
      ),
    );
    app.mount(host);
    await nextTick();
  },
  async set(step) {
    value.value = step % 2 ? '12 😺 34\n56' : '8 xx 42';
    await nextTick();
  },
  unmount() {
    app!.unmount();
    app = undefined;
  },
  frame: () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
};
