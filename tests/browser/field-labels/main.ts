import '@/styles/themes/compact.css';
import { createApp, h, provide, ref, type Component } from 'vue';
import { TextField, Select, Combobox, Button, fieldContextKey, type FieldLabelBehavior } from '@/index';
createApp({
  setup() {
    const behavior = ref<FieldLabelBehavior>('external');
    provide(fieldContextKey, { labelBehavior: behavior, labelClearance: '24px' });
    return () =>
      h('main', [
        h(
          Button,
          { onClick: () => (behavior.value = behavior.value === 'external' ? 'floating' : 'external') },
          () => 'Toggle labels',
        ),
        ...([TextField, Select, Combobox] as Component[]).flatMap((Field, index) => [
          h('label', { for: `native-${index}` }, `Native ${index}`),
          h(Field, { id: `native-${index}`, modelValue: '', options: [{ value: 'a', label: 'Alpha' }] }),
          h('span', { id: `custom-${index}` }, `Custom ${index}`),
          h(Field, { modelValue: '', label: 'Fallback', 'aria-labelledby': `custom-${index}`, options: [] }),
          h(Field, { modelValue: 'a', label: `Hidden ${index}`, options: [{ value: 'a', label: 'Alpha' }] }),
          h(Field, { modelValue: '', label: `Floating ${index}`, labelBehavior: 'floating', options: [] }),
        ]),
      ]);
  },
}).mount('#app');
