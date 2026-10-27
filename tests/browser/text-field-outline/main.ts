import '@/styles/themes/default.css';
import { createApp, h, reactive, ref } from 'vue';
import { Dialog, TextField } from '@/index';

import './style.css';

type FixtureOptions = {
  alwaysFloatLabel?: boolean;
  placeholder?: string;
  value?: string;
  visuallyFocused?: boolean;
};

const open = ref(true);
const state = reactive<Required<FixtureOptions>>({
  alwaysFloatLabel: false,
  placeholder: '',
  value: '',
  visuallyFocused: false,
});

window.__textFieldOutlineFixture = {
  setOptions(options) {
    Object.assign(state, {
      alwaysFloatLabel: false,
      placeholder: '',
      value: '',
      visuallyFocused: false,
      ...options,
    });
  },
};

createApp({
  setup() {
    return () =>
      h('div', [
        h(
          Dialog,
          {
            open: open.value,
            width: '22rem',
            'onUpdate:open': (nextOpen: boolean) => {
              open.value = nextOpen;
            },
          },
          {
            default: () =>
              h('form', { class: 'text-field-outline-fixture' }, [
                h(TextField, {
                  alwaysFloatLabel: state.alwaysFloatLabel,
                  label: 'First field with a long label',
                  modelValue: state.value,
                  placeholder: state.placeholder || undefined,
                  visuallyFocused: state.visuallyFocused,
                  'onUpdate:modelValue': (value: string) => {
                    state.value = value;
                  },
                }),
                h(TextField, {
                  label: 'Second field with another long label',
                  modelValue: '',
                }),
              ]),
          },
        ),
        h(
          'div',
          { class: 'text-field-outline-alignment-fixture' },
          (['extra-small', 'small', 'medium'] as const).map((size) =>
            h(TextField, {
              key: size,
              label: size,
              modelValue: 'Value',
              shape: 'square',
              size,
            }),
          ),
        ),
      ]);
  },
}).mount('#app');

declare global {
  interface Window {
    __textFieldOutlineFixture: {
      setOptions(options: FixtureOptions): void;
    };
  }
}
