<script setup lang="ts">
import { computed, ref } from 'vue';
import { vDropdown } from '@/directives/Menu';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Menu, MenuContainer, MenuDivider, MenuGap, MenuItem, MenuLabel, MenuSubMenu } from '@/components/Menu';

const dropdownMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const dropdownBinding = computed(() => dropdownMenu.value?.menuRef ?? null);
const selected = ref('None');
const submenuOpen = ref(false);
const nestedSubmenuOpen = ref(false);
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
    <Button v-dropdown="dropdownBinding">Open dropdown menu</Button>

    <Menu
      ref="dropdownMenu"
      @select="(_, item) => { selected = item.textContent?.trim() ?? 'None'; }"
    >
      <MenuContainer>
        <MenuItem>
          <template #leading><Icon name="visibility" /></template>
          Inspect
        </MenuItem>

        <MenuSubMenu v-model:open="submenuOpen">
          <template #trigger="{ open }">
            <MenuItem submenu :submenu-open="open">
              <template #leading><Icon name="folder_open" /></template>
              More actions
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
          Edit
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
        <MenuLabel>Actions</MenuLabel>
        <MenuItem>
          <template #leading><Icon name="cloud_queue" /></template>
          Sync
          <template #supporting>Supporting text</template>
        </MenuItem>
      </MenuContainer>
    </Menu>

    <div>Selected: {{ selected }}</div>
  </div>
</template>
