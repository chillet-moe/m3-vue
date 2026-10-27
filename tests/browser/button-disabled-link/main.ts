import '@/styles/themes/default.css';
import { createApp, h } from 'vue';
import { Button, FloatingActionButton, IconButton, ListItem } from '@/index';

createApp({
  render() {
    return h('div', [
      h(
        Button,
        {
          class: 'button-native-disabled',
          disabled: true,
          variant: 'filled',
        },
        { default: () => 'Native disabled' },
      ),
      h(
        Button,
        {
          class: 'button-link-disabled',
          disabled: true,
          href: '/blocked',
          variant: 'filled',
        },
        { default: () => 'Link disabled' },
      ),
      h(IconButton, {
        class: 'icon-button-native-disabled',
        disabled: true,
        icon: 'favorite',
        variant: 'filled',
      }),
      h(IconButton, {
        class: 'icon-button-link-disabled',
        disabled: true,
        href: '/blocked',
        icon: 'favorite',
        variant: 'filled',
      }),
      h(FloatingActionButton, {
        class: 'fab-native-disabled',
        disabled: true,
        icon: 'add',
      }),
      h(FloatingActionButton, {
        class: 'fab-link-disabled',
        disabled: true,
        href: '/blocked',
        icon: 'add',
      }),
      h(ListItem, {
        class: 'list-item-native-disabled',
        disabled: true,
        title: 'Native disabled',
      }),
      h(ListItem, {
        class: 'list-item-link-disabled',
        disabled: true,
        href: '/blocked',
        title: 'Link disabled',
      }),
    ]);
  },
}).mount('#app');
