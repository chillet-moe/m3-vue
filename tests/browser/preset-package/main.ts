import { createApp, h } from 'vue';
import { Button, Switch, IconButton, TextField, M3VuePlugin } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import { compact } from '@chillet/m3-vue/presets/compact';
import 'virtual:m3-color-themes.css';

createApp({
  render: () =>
    h('main', [
      h(Switch, { checked: true }, () => 'Compact'),
      h(IconButton, { icon: 'add' }),
      h(TextField, { modelValue: 'Compact', label: 'Name' }),
      h(Button, { class: 'warning-theme', variant: 'filled' }, () => 'Delete'),
    ]),
})
  .use(M3VuePlugin, { preset: compact })
  .mount('#app');
