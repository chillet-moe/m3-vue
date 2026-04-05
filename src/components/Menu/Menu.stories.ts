import type { Meta, StoryFn } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Menu from './Menu.vue';
import MenuItem from './MenuItem.vue';
import { menuStyles } from './index';
import { vDropdownMenu, vContextMenu } from '@/directives/Menu';
import type { MenuProps } from './Menu.vue';

const baseItems = `
  <MenuItem>Item 1</MenuItem>
  <MenuItem selected>Item 2</MenuItem>
  <MenuItem>Item 3</MenuItem>
  <hr :class="menuStyles.divider" />
  <div :class="menuStyles.gap" aria-hidden="true" />
  <MenuItem>Item 4</MenuItem>
`;

const meta = {
  component: Menu,
  args: {
    color: 'standard',
  },
} satisfies Meta<typeof Menu>;

export default meta;

const PureComponentTemplate: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Menu, MenuItem },
  setup: () => {
    const open = ref(false);
    const selected = ref('None');

    return { args, open, selected, menuStyles };
  },
  template: `
    <div style="padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <div style="display: flex; gap: 0.5rem;">
        <button @click="open = !open">Toggle menu</button>
        <button @click="open = false">Close</button>
      </div>

      <Menu
        v-bind="args"
        v-model:open="open"
        @select="(_, item) => { selected = item.textContent?.trim() ?? 'None'; }"
      >
        ${baseItems}
      </Menu>

      <div>Open: {{ open }}</div>
      <div>Selected: {{ selected }}</div>
    </div>
  `,
});

const DropdownDirectiveTemplate: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Menu, MenuItem },
  directives: { dropdownMenu: vDropdownMenu },
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
        ${baseItems}
      </Menu>

      <div>Selected: {{ selected }}</div>
    </div>
  `,
});

const ContextDirectiveTemplate: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Menu, MenuItem },
  directives: { contextMenu: vContextMenu },
  setup: () => {
    const selected = ref('None');

    return { args, selected };
  },
  template: `
    <div style="padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <div
        v-context-menu="'#context-menu'"
        style="inline-size: 20rem; block-size: 8rem; border: 1px dashed #999; display: grid; place-items: center;"
      >
        Right click here for context menu
      </div>

      <Menu
        id="context-menu"
        v-bind="args"
        @select="(_, item) => { selected = item.textContent?.trim() ?? 'None'; }"
      >
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </Menu>

      <div>Selected: {{ selected }}</div>
    </div>
  `,
});

export const PureComponent = PureComponentTemplate.bind({});
export const DropdownDirective = DropdownDirectiveTemplate.bind({});
export const ContextDirective = ContextDirectiveTemplate.bind({});
