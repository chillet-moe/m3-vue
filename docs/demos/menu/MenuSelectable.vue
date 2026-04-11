<script setup lang="ts">
import { computed, ref } from 'vue';
import { vDropdown } from '@/directives/Menu';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import type { MenuModelValue } from '@/components/Menu';
import { Menu, MenuContainer, MenuItem } from '@/components/Menu';

const singleMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const multipleMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const singleBinding = computed(() => singleMenu.value?.menuRef ?? null);
const multipleBinding = computed(() => multipleMenu.value?.menuRef ?? null);
const single = ref<MenuModelValue>('copy');
const multiple = ref<MenuModelValue>(['archive']);
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start">
    <div style="display: flex; flex-wrap: wrap; gap: 1rem">
      <Button v-dropdown="singleBinding">Open single-select menu</Button>
      <Button v-dropdown="multipleBinding">Open multi-select menu</Button>
    </div>

    <Menu ref="singleMenu" v-model="single">
      <MenuContainer>
        <MenuItem value="cut">
          <template #leading="{ selected }">
            <Icon :name="selected ? 'check' : 'content_cut'" />
          </template>
          Cut
        </MenuItem>
        <MenuItem value="copy">
          <template #leading="{ selected }">
            <Icon :name="selected ? 'check' : 'content_copy'" />
          </template>
          Copy
        </MenuItem>
        <MenuItem value="paste">
          <template #leading="{ selected }">
            <Icon :name="selected ? 'check' : 'content_paste'" />
          </template>
          Paste
        </MenuItem>
      </MenuContainer>
    </Menu>

    <Menu ref="multipleMenu" v-model="multiple" multiple>
      <MenuContainer>
        <MenuItem value="archive" :close-on-select="false">
          <template #leading="{ selected }">
            <Icon :name="selected ? 'check_box' : 'check_box_outline_blank'" />
          </template>
          Archive
        </MenuItem>
        <MenuItem value="favorite" :close-on-select="false">
          <template #leading="{ selected }">
            <Icon :name="selected ? 'check_box' : 'check_box_outline_blank'" />
          </template>
          Favorite
        </MenuItem>
        <MenuItem selected>
          <template #leading><Icon name="push_pin" /></template>
          Manual item without value
        </MenuItem>
      </MenuContainer>
    </Menu>

    <div>Single value: {{ single ?? 'None' }}</div>
    <div>Multiple values: {{ Array.isArray(multiple) ? multiple.join(', ') : 'None' }}</div>
  </div>
</template>
