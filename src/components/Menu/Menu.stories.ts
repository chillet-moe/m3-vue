import type { Meta, StoryFn } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { vContextMenu, vDropdownMenu } from '@/directives/Menu';
import Icon from '@/components/Icon/Icon.vue';
import type { MenuProps } from './Menu.vue';
import Menu from './Menu.vue';
import MenuContainer from './MenuContainer.vue';
import MenuDivider from './MenuDivider.vue';
import MenuGap from './MenuGap.vue';
import MenuItem from './MenuItem.vue';
import MenuLabel from './MenuLabel.vue';
import MenuSubMenu from './MenuSubMenu.vue';
import { Button } from '@/components/Button';

const baseItems = `
  <MenuContainer>
    <MenuItem>
      <template #leading><Icon name="visibility" /></template>
      Item 1
    </MenuItem>

    <MenuSubMenu v-model:open="submenuOpen">
      <template #trigger="{ open }">
        <MenuItem submenu :submenu-open="open">
          <template #leading><Icon name="content_copy" /></template>
          Item 2
          <template #trailing><Icon name="chevron_right" /></template>
        </MenuItem>
      </template>

      <MenuContainer>
        <MenuItem>
          <template #leading><Icon name="drive_file_rename_outline" /></template>
          Rename
        </MenuItem>

        <MenuSubMenu v-model:open="nestedSubmenuOpen">
          <template #trigger="{ open }">
            <MenuItem submenu :submenu-open="open">
              <template #leading><Icon name="share" /></template>
              Share
              <template #trailing><Icon name="chevron_right" /></template>
            </MenuItem>
          </template>

          <MenuContainer>
            <MenuItem>Copy link</MenuItem>
            <MenuItem>Invite user</MenuItem>
          </MenuContainer>
        </MenuSubMenu>
      </MenuContainer>
    </MenuSubMenu>

    <MenuDivider />

    <MenuItem selected>
      <template #leading><Icon name="edit" /></template>
      Item 3
      <template #badge>
        <span
          style="padding: 0.125rem 0.5rem; border-radius: 999px; background: --translucent(var(--md-sys-color-primary), 0.16); color: var(--md-sys-color-primary);"
        >
          New
        </span>
      </template>
    </MenuItem>
  </MenuContainer>

  <MenuGap />

  <MenuContainer>
    <MenuLabel>Label text</MenuLabel>

    <MenuItem>
      <template #leading><Icon name="cloud_queue" /></template>
      Item 4
      <template #supporting>Supporting text</template>
      <template #trailingText>Ctrl+C</template>
    </MenuItem>
  </MenuContainer>
`;

const pureBaseItems = `
  <MenuContainer>
    <MenuItem>
      <template #leading><Icon name="visibility" /></template>
      Item 1
    </MenuItem>

    <MenuItem>
      <template #leading><Icon name="content_copy" /></template>
      Item 2
      <template #trailingText>Ctrl+C</template>
    </MenuItem>

    <MenuDivider />

    <MenuItem selected>
      <template #leading><Icon name="edit" /></template>
      Item 3
      <template #badge>
        <span
          style="padding: 0.125rem 0.5rem; border-radius: 999px; background: --translucent(var(--md-sys-color-primary), 0.16); color: var(--md-sys-color-primary);"
        >
          New
        </span>
      </template>
    </MenuItem>
  </MenuContainer>

  <MenuGap />

  <MenuContainer>
    <MenuLabel>Label text</MenuLabel>

    <MenuItem>
      <template #leading><Icon name="cloud_queue" /></template>
      Item 4
      <template #supporting>Supporting text</template>
    </MenuItem>
  </MenuContainer>
`;

const safeTriangleItems = `
  <MenuContainer>
    <MenuItem>
      <template #leading><Icon name="visibility" /></template>
      Inspect
    </MenuItem>

    <MenuSubMenu v-model:open="submenuOpen" debug-safe-triangle>
      <template #trigger="{ open }">
        <MenuItem submenu :submenu-open="open">
          <template #leading><Icon name="folder_open" /></template>
          Move toward submenu
          <template #trailing><Icon name="chevron_right" /></template>
        </MenuItem>
      </template>

      <MenuContainer>
        <MenuItem>
          <template #leading><Icon name="drive_file_move" /></template>
          Move
        </MenuItem>
        <MenuItem>
          <template #leading><Icon name="content_copy" /></template>
          Duplicate
        </MenuItem>
        <MenuItem>
          <template #leading><Icon name="archive" /></template>
          Archive
        </MenuItem>
      </MenuContainer>
    </MenuSubMenu>

    <MenuItem>
      <template #leading><Icon name="delete" /></template>
      Delete
    </MenuItem>
  </MenuContainer>
`;

const meta = {
  component: Menu,
  args: {
    color: 'standard',
  },
} satisfies Meta<typeof Menu>;

export default meta;

const DropdownDirectiveTemplate: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Icon, Menu, MenuContainer, MenuDivider, MenuGap, MenuItem, MenuLabel, MenuSubMenu, Button },
  directives: { dropdownMenu: vDropdownMenu },
  setup: () => {
    const selected = ref('None');
    const submenuOpen = ref(false);
    const nestedSubmenuOpen = ref(false);

    return { args, nestedSubmenuOpen, selected, submenuOpen };
  },
  template: `
    <div style="padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <Button v-dropdown-menu="'#dropdown-menu'">Open dropdown menu</Button>

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
  components: { Icon, Menu, MenuContainer, MenuDivider, MenuGap, MenuItem, MenuLabel, MenuSubMenu },
  directives: { contextMenu: vContextMenu },
  setup: () => {
    const selected = ref('None');
    const submenuOpen = ref(false);
    const nestedSubmenuOpen = ref(false);

    return { args, nestedSubmenuOpen, selected, submenuOpen };
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
        <MenuContainer>
          <MenuItem>
            <template #leading><Icon name="content_cut" /></template>
            Cut
          </MenuItem>
          <MenuItem>
            <template #leading><Icon name="content_copy" /></template>
            Copy
          </MenuItem>
          <MenuItem>
            <template #leading><Icon name="content_paste" /></template>
            Paste
          </MenuItem>
        </MenuContainer>
      </Menu>

      <div>Selected: {{ selected }}</div>
    </div>
  `,
});

const SafeTriangleTemplate: StoryFn<MenuProps> = (args: MenuProps) => ({
  components: { Icon, Menu, MenuContainer, MenuDivider, MenuGap, MenuItem, MenuLabel, MenuSubMenu, Button },
  directives: { dropdownMenu: vDropdownMenu },
  setup: () => {
    const submenuOpen = ref(false);

    return { args, submenuOpen };
  },
  template: `
    <div style="padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
      <div style="max-inline-size: 28rem; color: var(--md-sys-color-on-surface-variant);">
        Open the menu, hover "Move toward submenu", then move diagonally into the child menu. The colored cone is the
        safe triangle that keeps the submenu open during mouse travel.
      </div>

      <Button v-dropdown-menu="'#safe-triangle-menu'">Open safe triangle demo</Button>

      <Menu id="safe-triangle-menu" v-bind="args">
        ${safeTriangleItems}
      </Menu>
    </div>
  `,
});

export const DropdownDirective = DropdownDirectiveTemplate.bind({});
export const ContextDirective = ContextDirectiveTemplate.bind({});
export const SafeTriangle = SafeTriangleTemplate.bind({});
