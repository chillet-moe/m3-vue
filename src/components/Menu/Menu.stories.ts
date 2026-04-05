import type { Meta, StoryFn } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Menu from './Menu.vue';
import MenuItem from './MenuItem.vue';
import { menuStyles } from './index';
import type { MenuProps } from './Menu.vue';

const meta = {
  component: Menu,
  args: {
    triggerLabel: 'Actions',
    color: 'standard',
    closeOnSelect: true,
  },
} satisfies Meta<typeof Menu>;

export default meta;

const Template: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Menu, MenuItem },
  setup: () => {
    const open = ref(false);
    const selected = ref('None');

    return { args, open, selected, menuStyles };
  },
  template: `
    <div style="padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <Menu
        v-bind="args"
        v-model:open="open"
        @select="(_, item) => { selected = item.textContent?.trim() ?? 'None'; }"
      >
        <MenuItem>Item 1</MenuItem>
        <MenuItem selected>Item 2</MenuItem>
        <MenuItem>Item 3</MenuItem>
        <hr :class="menuStyles.divider" />
        <div :class="menuStyles.gap" aria-hidden="true" />
        <MenuItem>Item 4</MenuItem>
        <MenuItem disabled>Item 5</MenuItem>
      </Menu>
      <div>Selected: {{ selected }}</div>
      <div>Open: {{ open }}</div>
    </div>
  `,
});

export const Default = Template.bind({});
