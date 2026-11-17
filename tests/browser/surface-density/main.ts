import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import {
  Dialog,
  BottomSheet,
  SideSheet,
  TextField,
  Button,
  CircularProgressIndicator,
  LinearProgressIndicator,
  LoadingIndicator,
} from '@/index';
createApp({
  setup() {
    const open = ref(false);
    const indeterminate = ref(false);
    const kind = ref('Dialog');
    const surfaces = { Dialog, BottomSheet, SideSheet };
    return () =>
      h('main', [
        ...Object.keys(surfaces).map((name) =>
          h(
            Button,
            {
              onClick: () => {
                kind.value = name;
                open.value = true;
              },
            },
            () => name,
          ),
        ),
        h(
          surfaces[kind.value as keyof typeof surfaces],
          { open: open.value, 'onUpdate:open': (v: boolean) => (open.value = v) },
          {
            headline: () => 'Settings',
            default: () => h(TextField, { label: 'Name', modelValue: 'Assembly' }),
            actions: () => h(Button, { onClick: () => (open.value = false) }, () => 'Close'),
          },
        ),
        h(Button, { onClick: () => (indeterminate.value = !indeterminate.value) }, () => 'Toggle circular progress'),
        ...(['flat', 'wavy'] as const).flatMap((shape) => [
          h(CircularProgressIndicator, {
            shape,
            value: 0.5,
            indeterminate: indeterminate.value,
            'data-testid': `circle-${shape}`,
          }),
          h(LinearProgressIndicator, { shape, value: 0.5, 'data-testid': `line-${shape}` }),
        ]),
        h(CircularProgressIndicator, { size: '3rem', thickness: '2px', 'data-testid': 'override' }),
        h(LoadingIndicator, { variant: 'contained', indicatorSize: '38px', 'data-testid': 'loading-indicator' }),
      ]);
  },
}).mount('#app');
