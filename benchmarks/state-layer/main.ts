import { Button } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick } from 'vue';

declare global {
  interface Window {
    mountStateLayerBenchmark: (count: number) => Promise<void>;
  }
}

window.mountStateLayerBenchmark = async (count) => {
  createApp(() =>
    Array.from({ length: count }, (_, index) =>
      h(Button, { key: index, variant: 'tonal', leadingIcon: index % 2 ? 'edit' : undefined }, () => 'Action ' + index),
    ),
  ).mount(document.querySelector('main')!);
  await nextTick();
};
