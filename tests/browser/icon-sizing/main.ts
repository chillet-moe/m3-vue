import '@/styles/themes/default.css';
import { createApp, h } from 'vue';
import {
  Button,
  IconButton,
  Icon,
  Chip,
  Menu,
  MenuContainer,
  MenuItem,
  TextField,
  ListItem,
  TreeView,
  Tabs,
  TabList,
  Tab,
  Select,
} from '@/index';
const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
createApp({
  render: () =>
    h('main', [
      ...sizes.flatMap((size) => [
        h(Button, { size, leadingIcon: 'settings', 'data-test': `button-${size}` }, () => 'Export'),
        h(IconButton, { size, icon: 'settings', 'data-test': `icon-${size}` }),
      ]),
      h(Tabs, { modelValue: 'one', 'data-test': 'tabs' }, () =>
        h(TabList, {}, () =>
          h(Tab, { value: 'one' }, { default: () => 'Tab', icon: () => h(Icon, { name: 'settings' }) }),
        ),
      ),
      h(Select, {
        modelValue: 'one',
        options: [{ value: 'one', label: 'One' }],
        clearable: true,
        'data-test': 'select-clear',
      }),
      h(Chip, { leadingIcon: 'settings', 'data-test': 'chip' }, () => 'Chip'),
      h(Menu, { open: true }, () =>
        h(MenuContainer, {}, () =>
          h(
            MenuItem,
            { 'data-test': 'menu' },
            {
              default: () => 'Menu',
              leading: () => h(Icon, { name: 'settings' }),
              trailing: () => h(Icon, { name: 'chevron_right' }),
            },
          ),
        ),
      ),
      h(ListItem, { leadingIcon: 'settings', 'data-test': 'list' }, () => 'List'),
      h('div', { 'data-test': 'field' }, [
        h(TextField, { label: 'Field', modelValue: '' }, { leading: () => h(Icon, { name: 'settings' }) }),
      ]),
      h(TreeView, { items: [{ value: 'one', label: 'Tree', icon: 'settings' }], 'data-test': 'tree' }),
      h(IconButton, { size: 'large', 'data-test': 'slotted-icon' }, () =>
        h(Icon, { contentRatio: 1 }, () => h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'M0 0h24v24H0z' })])),
      ),
      h(Icon, { name: 'settings', size: '32px', 'data-test': 'explicit' }),
      h(Icon, { name: 'settings', variant: 'inline', 'data-test': 'inline' }),
      h(Icon, { name: 'settings', 'data-test': 'symbol' }),
      h(Icon, { 'data-test': 'svg', contentRatio: 1 }, () =>
        h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: 'M0 0h24v24H0z' })]),
      ),
      h(
        Button,
        { leadingIcon: 'settings', style: '--md-button-icon-size: 30px', 'data-test': 'override' },
        () => 'Fixed',
      ),
    ]),
}).mount('#app');
