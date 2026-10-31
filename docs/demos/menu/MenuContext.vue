<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { vContextMenu } from '@/directives/Menu';
import { Icon } from '@/components/Icon';
import { Menu, MenuContainer, MenuItem } from '@/components/Menu';

const selected = ref('None');
const id = useId();
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start">
    <div
      v-context-menu="`#${id}`"
      style="
        inline-size: 20rem;
        block-size: 8rem;
        border: 1px dashed var(--md-sys-color-outline);
        display: grid;
        place-items: center;
      "
    >
      Right click here for context menu
    </div>

    <Menu
      :id="id"
      @select="
        (_: MouseEvent, item: { textContent: string }) => {
          selected = item.textContent?.trim() ?? 'None';
        }
      "
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
</template>
