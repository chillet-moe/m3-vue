<script setup lang="ts">
import { computed, ref } from 'vue';
import { vDropdown } from '@/directives/Menu';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Menu, MenuContainer, MenuItem } from '@/components/Menu';

const dropdownMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const dropdownBinding = computed(() => dropdownMenu.value?.menuRef ?? null);
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start">
    <Button v-dropdown="dropdownBinding">Open navigation menu</Button>

    <Menu ref="dropdownMenu">
      <MenuContainer>
        <MenuItem href="#menu-native-link">
          <template #leading><Icon name="open_in_new" /></template>
          Native link
          <template #supporting>Use href on MenuItem instead of nesting an a tag.</template>
        </MenuItem>

        <MenuItem href="#menu-help-center">
          <template #leading><Icon name="help" /></template>
          Help center
          <template #supporting>Link items keep the same menu closing and keyboard behavior.</template>
        </MenuItem>
      </MenuContainer>
    </Menu>
  </div>
</template>
