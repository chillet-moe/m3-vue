import type { Meta, StoryFn } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Menu from './Menu.vue';
import type { MenuProps } from './Menu.vue';

const meta = {
  component: Menu,
  args: {
    triggerLabel: 'Actions',
    closeOnSelect: true,
    items: [
      { label: 'Edit', value: 'edit' },
      { label: 'Duplicate', value: 'duplicate' },
      { label: 'Archive', value: 'archive' },
      { label: 'Delete', value: 'delete', disabled: true },
    ],
  },
} satisfies Meta<typeof Menu>;

export default meta;

const Template: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Menu },
  setup: () => {
    const open = ref(false);
    const selected = ref('None');

    return { args, open, selected };
  },
  template: `
    <div style="padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <Menu
        v-bind="args"
        v-model:open="open"
        @select="(item) => { selected = item.value; }"
      />
      <div>Selected: {{ selected }}</div>
      <div>Open: {{ open }}</div>
    </div>
  `,
});

export const Default = Template.bind({});
