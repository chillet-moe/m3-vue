import type { Meta, StoryFn } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Menu from './Menu.vue';
import MenuItem from './MenuItem.vue';
import { menuStyles } from './index';
import { vDropdownMenu, vContextMenu } from '@/directives/Menu';
import type { MenuProps } from './Menu.vue';

const meta = {
  component: Menu,
  args: {
    color: 'standard',
  },
} satisfies Meta<typeof Menu>;

export default meta;

const Template: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Menu, MenuItem },
  directives: { dropdownMenu: vDropdownMenu, contextMenu: vContextMenu },
  setup: () => {
    const selected = ref('None');

    return { args, selected, menuStyles };
  },
  template: `
    <div style="padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <button v-dropdown-menu="'#dropdown-menu'">Open dropdown menu</button>

      <Menu
        id="dropdown-menu"
        v-bind="args"
        @select="(_, item) => { selected = item.textContent?.trim() ?? 'None'; }"
      >
        <MenuItem>Item 1</MenuItem>
        <MenuItem selected>Item 2</MenuItem>
        <MenuItem>Item 3</MenuItem>
        <hr :class="menuStyles.divider" />
        <div :class="menuStyles.gap" aria-hidden="true" />
        <MenuItem>Item 4</MenuItem>
      </Menu>

      <div
        v-context-menu="'#context-menu'"
        style="inline-size: 18rem; block-size: 6rem; border: 1px dashed #999; display: grid; place-items: center;"
      >
        Right click here for context menu
      </div>

      <Menu id="context-menu" v-bind="args">
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </Menu>

      <div>Selected: {{ selected }}</div>
    </div>
  `,
});

export const Default = Template.bind({});
