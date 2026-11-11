import { Combobox, Icon } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const target = document.querySelector<HTMLElement>('#fixture')!;
const options = [
  { label: 'Alabama', value: 'alabama' },
  { label: 'Alaska', value: 'alaska' },
  { label: 'Colorado', value: 'colorado' },
  { label: 'Connecticut', value: 'connecticut' },
];
const step = ref(0);
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount(count) {
    step.value = 0;
    app = createApp({
      render() {
        const alternate = step.value % 2 === 1;
        return h(
          'div',
          { style: { display: 'contents' } },
          Array.from({ length: count }, (_, i) =>
            h(
              Combobox,
              {
                key: i,
                id: 'state-' + i,
                label: 'State ' + i,
                labelClearance: '6px',
                options,
                name: 'state-' + i,
                class: alternate ? 'alternate' : 'initial',
                style: { '--md-menu-container-color': alternate ? '#ffffff' : '#eeeeee' },
                'aria-label': alternate ? 'Alternate state ' + i : 'Choose state ' + i,
              },
              { leading: () => h(Icon, { name: 'location_on' }) },
            ),
          ),
        );
      },
    });
    app.mount(target);
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
