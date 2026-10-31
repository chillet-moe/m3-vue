import '@/styles/themes/default.css';
import { createApp, h } from 'vue';
import { TextField, Select, Combobox, Button, Icon } from '@/index';
createApp(() =>
  h(
    'main',
    ['extra-small', 'small', 'medium'].map((size) =>
      h('section', { 'data-size': size }, [
        h(Button, { size, leadingIcon: 'search' }, () => 'Search'),
        h(
          TextField,
          { size, modelValue: 'Assembly', label: 'Name', labelBehavior: 'external' },
          { leading: () => h(Icon, { name: 'search' }) },
        ),
        h(Select, { size, modelValue: 'mm', options: [{ value: 'mm', label: 'mm' }], label: 'Units', clearable: true }),
        h(Combobox, { size, modelValue: 'mm', options: [{ value: 'mm', label: 'mm' }], label: 'Units' }),
      ]),
    ),
  ),
).mount('#app');
