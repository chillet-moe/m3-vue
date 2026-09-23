import { createApp, h, ref, withDirectives } from 'vue';
import Menu from '@/components/Menu/Menu.vue';
import MenuContainer from '@/components/Menu/MenuContainer.vue';
import MenuItem from '@/components/Menu/MenuItem.vue';
import Select from '@/components/Select/Select.vue';
import { vDropdown } from '@/directives/Menu';

const menuSelection = ref('');
const selectValue = ref<string>();

createApp(() =>
  h('div', { style: 'padding: 80px; display: grid; gap: 80px; width: 320px' }, [
    h('div', [
      withDirectives(h('button', { id: 'menu-trigger', type: 'button' }, 'Open menu'), [[vDropdown, '#press-menu']]),
      h('output', { id: 'menu-selection' }, menuSelection.value),
      h(
        Menu,
        {
          id: 'press-menu',
          onSelect: (_event: MouseEvent, item: HTMLElement) => (menuSelection.value = item.textContent?.trim() ?? ''),
        },
        () => h(MenuContainer, null, () => [h(MenuItem, null, () => 'First'), h(MenuItem, null, () => 'Second')]),
      ),
    ]),
    h(Select, {
      label: 'Coffee',
      options: [
        { label: 'Espresso', value: 'espresso' },
        { label: 'Pour-over', value: 'pour-over' },
      ],
      modelValue: selectValue.value,
      'onUpdate:modelValue': (value) => {
        selectValue.value = value as string;
      },
    }),
    h('output', { id: 'select-value' }, selectValue.value),
  ]),
).mount('#app');
