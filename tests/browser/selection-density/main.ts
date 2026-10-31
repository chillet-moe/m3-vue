import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import { CheckBox, Radio, Switch } from '@/index';
createApp({
  setup() {
    const checked = ref(false);
    const selected = ref(false);
    const switched = ref(false);
    return () =>
      h('main', [
        h(
          Switch,
          {
            checked: switched.value,
            'onUpdate:checked': (value) => (switched.value = value),
            'data-testid': 'switch',
            checkedIcon: 'check',
            uncheckedIcon: 'close',
          },
          () => 'Switch option',
        ),
        h(
          CheckBox,
          { checked: checked.value, 'onUpdate:checked': (value) => (checked.value = value), 'data-testid': 'checkbox' },
          () => 'Check option',
        ),
        h(
          Radio,
          { checked: selected.value, 'onUpdate:checked': (value) => (selected.value = value), 'data-testid': 'radio' },
          () => 'Radio option',
        ),
        h(Switch, { size: 'small', checked: true, 'data-testid': 'switch-small' }),
        h(Switch, {
          size: 'small',
          checked: true,
          presentation: true,
          style: '--md-switch-target-size: 80px',
          'data-testid': 'switch-small-presentation',
        }),
        h(Switch, { checked: true, presentation: true, 'data-testid': 'switch-presentation' }),
        h(CheckBox, { checked: true, presentation: true, 'data-testid': 'checkbox-presentation' }),
        h(Radio, { checked: true, presentation: true, 'data-testid': 'radio-presentation' }),
      ]);
  },
}).mount('#app');
