<script setup lang="ts">
import { computed, ref } from 'vue';
import { vContextMenu } from '@/directives/Menu';
import { Icon } from '@/components/Icon';
import { Menu, MenuContainer, MenuItem } from '@/components/Menu';

const contextMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const contextMenuBinding = computed(() => contextMenu.value?.menuRef ?? null);
const selected = ref('None');
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
    <div
      v-context-menu="contextMenuBinding"
      style="inline-size: 20rem; block-size: 8rem; border: 1px dashed #999; display: grid; place-items: center;"
    >
      Right click here for context menu
    </div>

    <Menu ref="contextMenu" @select="(_, item) => { selected = item.textContent?.trim() ?? 'None'; }">
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
</template>
