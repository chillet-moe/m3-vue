<script setup lang="ts">
import { computed, ref } from 'vue';
import { vDropdown } from '@/directives/Menu';
import { Button } from '@/components/Button';
import { CheckBox } from '@/components/CheckBox';
import { Radio } from '@/components/Radio';
import type { MenuModelValue } from '@/components/Menu';
import { Menu, MenuContainer, MenuItem } from '@/components/Menu';

const singleMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const multipleMenu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const singleBinding = computed(() => singleMenu.value?.menuRef ?? null);
const multipleBinding = computed(() => multipleMenu.value?.menuRef ?? null);
const single = ref<MenuModelValue>('name');
const multiple = ref<MenuModelValue>(['size']);
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start">
    <div style="display: flex; flex-wrap: wrap; gap: 1rem">
      <Button v-dropdown="singleBinding">Sort by</Button>
      <Button v-dropdown="multipleBinding">Visible columns</Button>
    </div>

    <Menu ref="singleMenu" v-model="single">
      <MenuContainer>
        <MenuItem v-for="option in ['Name', 'Modified', 'Size']" :key="option" :value="option.toLowerCase()">
          <template #leading="{ checked, disabled }">
            <Radio presentation :checked="checked" :disabled="disabled" />
          </template>
          {{ option }}
        </MenuItem>
      </MenuContainer>
    </Menu>

    <Menu ref="multipleMenu" v-model="multiple" multiple>
      <MenuContainer>
        <MenuItem
          v-for="option in ['Size', 'Modified', 'Owner']"
          :key="option"
          :value="option.toLowerCase()"
          :disabled="option === 'Owner'"
          :close-on-select="false"
        >
          <template #leading="{ checked, disabled }">
            <CheckBox presentation :checked="checked" :disabled="disabled" />
          </template>
          {{ option }}
        </MenuItem>
      </MenuContainer>
    </Menu>

    <div>Sort by: {{ single ?? 'None' }}</div>
    <div>Visible columns: {{ Array.isArray(multiple) ? multiple.join(', ') : 'None' }}</div>
  </div>
</template>
