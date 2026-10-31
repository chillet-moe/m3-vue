import { createApp, h } from 'vue';
import { Switch, IconButton, TextField, M3VuePlugin } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import { compact } from '@chillet/m3-vue/presets/compact';

createApp({
  render: () =>
    h('main', [
      h(Switch, { checked: true }, () => 'Compact'),
      h(IconButton, { icon: 'add' }),
      h(TextField, { modelValue: 'Compact', label: 'Name' }),
    ]),
})
  .use(M3VuePlugin, { preset: compact })
  .mount('#app');
