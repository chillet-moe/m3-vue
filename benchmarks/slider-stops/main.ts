import { Slider } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const host = document.querySelector('main')!;
const sparseStops = [25, 50, 75];
const denseStops = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const stops = ref(sparseStops);
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount(count) {
    stops.value = sparseStops;
    app = createApp(() =>
      Array.from({ length: count }, (_, key) =>
        h(Slider, {
          key,
          value: 45,
          min: 0,
          max: 100,
          step: 1,
          appearance: 'expressive',
          startIcon: 'brightness_6',
          endIcon: 'brightness_7',
          valueIndicator: false,
          stopIndicators: stops.value,
          style: { width: '440px' },
        }),
      ),
    );
    app.mount(host);
    await nextTick();
  },
  async set(step) {
    stops.value = step % 2 ? denseStops : sparseStops;
    await nextTick();
    await nextTick();
  },
  unmount() {
    app!.unmount();
    app = undefined;
  },
  frame: () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
};
