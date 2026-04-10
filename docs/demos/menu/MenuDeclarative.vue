<script setup lang="ts">
import { computed, ref } from 'vue';
import { vDropdown } from '@/directives/Menu';
import { Button } from '@/components/Button';
import type { MenuContentItem, MenuModelValue } from '@/components/Menu';
import { Menu, MenuContainer, MenuItem } from '@/components/Menu';

const items: MenuContentItem[] = [
  {
    type: 'group',
    items: [
      {
        label: 'Cut',
        value: 'cut',
        leadingIcon: 'content_cut',
      },
      {
        label: 'Copy',
        value: 'copy',
        leadingIcon: 'content_copy',
        supportingText: 'Recommended',
      },
      {
        type: 'submenu',
        label: 'More actions',
        leadingIcon: 'more_horiz',
        items: [
          {
            label: 'Archive',
            value: 'archive',
          },
          {
            label: 'Favorite',
            value: 'favorite',
          },
        ],
      },
    ],
  },
  {
    type: 'gap',
  },
  {
    type: 'group',
    items: [
      {
        type: 'label',
        label: 'Danger zone',
      },
      {
        label: 'Delete',
        trailingText: 'Del',
      },
    ],
  },
];

const objectMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const objectBinding = computed(() => objectMenu.value?.menuRef ?? null);
const value = ref<MenuModelValue>('copy');
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
    <Button v-dropdown="objectBinding">Open object-driven menu</Button>

    <Menu ref="objectMenu" v-model="value" :items="items">
      <MenuContainer>
        <MenuItem selected>Extra slotted item</MenuItem>
      </MenuContainer>
    </Menu>

    <div>Current value: {{ value ?? 'None' }}</div>
  </div>
</template>
