import { createApp, h, ref } from 'vue';
import { Button, DateRangePicker, M3VuePlugin } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';

const open = ref(false);
const closedModel = new URLSearchParams(location.search).get('workload') === 'model';
const model = ref({ start: '2026-04-10', end: '2026-04-20' });

declare global {
  interface Window {
    setRangeBenchmarkStart: (start: string) => void;
  }
}

window.setRangeBenchmarkStart = (start) => {
  model.value = { start, end: '2026-04-20' };
};

createApp({
  render: () =>
    h('main', [
      h(Button, { onClick: () => (open.value = true) }, () => 'Open calendar'),
      ...Array.from({ length: closedModel ? 24 : 1 }, (_, index) =>
        h(DateRangePicker, {
          key: index,
          id: closedModel ? `calendar-${index}` : 'calendar',
          open: open.value,
          'onUpdate:open': (value) => (open.value = value),
          modelValue: model.value,
          variant: 'modal',
          today: '2026-04-15',
          min: '2026-04-02',
          max: '2026-06-26',
          locale: 'en-US',
        }),
      ),
    ]),
})
  .use(M3VuePlugin)
  .mount('#app');
