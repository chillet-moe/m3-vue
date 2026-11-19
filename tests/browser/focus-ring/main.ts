import '@/styles/theme.css';
import '@/styles/themes/default.css';
import Button from '@/components/Button/Button.vue';
import Slider from '@/components/Slider/Slider.vue';
import Switch from '@/components/Switch/Switch.vue';
import {
  Breadcrumb,
  CheckBox,
  Chip,
  FloatingActionButton,
  IconButton,
  ListItem,
  NavigationDrawerItem,
  NavigationRailItem,
  Radio,
  Tab,
  TabList,
  Tabs,
  vFocusRing,
} from '@/index';
import { createApp, h, ref, withDirectives } from 'vue';

const customLabel = ref('Custom action');

const scroller = (id: string, contents: () => ReturnType<typeof h>) =>
  h(
    'div',
    {
      id,
      style: { overflow: 'auto', transform: 'translateZ(0)', inlineSize: '15rem', blockSize: '6rem' },
    },
    h('div', { style: { paddingBlockStart: '12px', minBlockSize: '15rem' } }, contents()),
  );

const keyboardAudit = () => {
  const controls = [
    h(Button, {}, () => 'Tab button'),
    h(IconButton, { icon: 'edit', 'aria-label': 'Tab icon button' }),
    h(Chip, { variant: 'assist' }, () => 'Tab chip'),
    h(CheckBox, { checked: false, ariaLabel: 'Tab checkbox' }, () =>
      h(Button, { href: '#keyboard-audit-end' }, () => 'Tab checkbox link'),
    ),
    h(Radio, { checked: false, ariaLabel: 'Tab radio', style: { '--md-radio-target-size': '24px' } }),
    h(Switch, { checked: false, ariaLabel: 'Tab switch' }),
    h(FloatingActionButton, { icon: 'add' }, () => 'Tab FAB'),
    h(ListItem, { title: 'Tab list item' }),
    h(NavigationRailItem, { label: 'Tab rail item', ariaLabel: 'Tab rail item', icon: 'home' }),
    h(NavigationDrawerItem, { label: 'Tab drawer item', ariaLabel: 'Tab drawer item', icon: 'home' }),
    h(Breadcrumb, { items: [{ label: 'Tab breadcrumb', href: '#' }, { label: 'Current' }] }),
    h(Tabs, { modelValue: 'tab' }, () => h(TabList, {}, () => h(Tab, { value: 'tab' }, () => 'Tab trigger'))),
  ];
  return h('section', { id: 'keyboard-audit', style: { display: 'grid', justifyItems: 'start', gap: '0.75rem' } }, [
    h('button', { id: 'keyboard-audit-start' }, 'Start keyboard audit'),
    ...controls.map((control) => h('div', { style: { overflow: 'hidden', transform: 'translateZ(0)' } }, control)),
    h('button', { id: 'keyboard-audit-end' }, 'End keyboard audit'),
  ]);
};

createApp({
  render() {
    if (new URLSearchParams(location.search).has('keyboard-audit')) {
      return h('main', { style: { margin: '2rem' } }, keyboardAudit());
    }
    return h('main', { style: { margin: '2rem', '--md-button-focus-indicator-color': '#c00080' } }, [
      scroller('app-clip', () => h(Button, { variant: 'outlined' }, () => 'Action')),
      h(Button, { toggleable: true }, () => h('input', { type: 'checkbox', 'aria-label': 'Toggle action' })),
      h('button', { type: 'button', id: 'next' }, 'Next'),
      h(
        'dialog',
        { id: 'dialog' },
        scroller('dialog-clip', () => h(Button, { variant: 'outlined' }, () => 'In dialog')),
      ),
      scroller('custom-clip', () =>
        withDirectives(
          h(
            'button',
            {
              type: 'button',
              style: { '--md-focus-ring-color': '#c00080', borderRadius: '8px' },
              onClick: () => (customLabel.value = 'Updated custom action'),
            },
            customLabel.value,
          ),
          [[vFocusRing]],
        ),
      ),
      scroller('input-clip', () =>
        withDirectives(
          h(
            'label',
            { id: 'input-surface', style: { display: 'inline-block', '--md-focus-ring-color': '#c00080' } },
            h('input', { 'aria-label': 'Custom input', style: { display: 'block' } }),
          ),
          [[vFocusRing, { within: true }]],
        ),
      ),
      withDirectives(h('input', { 'aria-label': 'Direct input' }), [[vFocusRing]]),
      h(Switch, { checked: true, ariaLabel: 'Switch action' }),
      ...(['horizontal-ltr', 'horizontal-rtl', 'vertical-ltr', 'vertical-rtl'] as const).map((axis) => {
        const vertical = axis.startsWith('vertical');
        const slider = h(Slider, {
          'aria-label': axis,
          appearance: vertical ? 'standard' : 'expressive',
          vertical,
          direction: axis.endsWith('rtl') ? 'rtl' : 'ltr',
          value: 25,
          min: 0,
          max: 100,
          step: 1,
          style: { inlineSize: '10rem' },
        });
        return axis === 'horizontal-ltr'
          ? h('div', { id: 'slider-clip', style: { overflow: 'hidden', inlineSize: 'fit-content' } }, slider)
          : slider;
      }),
    ]);
  },
}).mount('#app');
