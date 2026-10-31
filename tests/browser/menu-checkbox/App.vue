<script setup lang="ts">
import MenuSelectable from '../../../docs/demos/menu/MenuSelectable.vue';
import { ref } from 'vue';
import { Button, CheckBox, Radio, ListItem, Menu, MenuContainer, MenuItem, vDropdown, type RowSize } from '@/index';
const menu = ref<InstanceType<typeof Menu>>();
const checked = ref(false);
const size = ref<RowSize>('medium');
</script>
<template>
  <MenuSelectable />
  <Radio data-testid="standalone-radio" v-model:checked="checked" />
  <select v-model="size" aria-label="Row size">
    <option v-for="value in ['extra-small', 'small', 'medium', 'large', 'extra-large']" :key="value">
      {{ value }}
    </option>
  </select>
  <Button v-dropdown="menu?.menuRef">Options</Button>
  <CheckBox data-testid="standalone" v-model:checked="checked" />
  <ListItem title="List selection" interactive role="checkbox" :aria-checked="checked" @click="checked = !checked">
    <template #leading><CheckBox presentation :checked="checked" /></template>
  </ListItem>
  <Menu ref="menu" :size="size">
    <MenuContainer>
      <MenuItem>Command</MenuItem>
      <MenuItem role="menuitemcheckbox" :checked="checked" :close-on-select="false" @click="checked = !checked">
        <template #leading="{ checked, disabled }"
          ><CheckBox presentation :checked="checked" :disabled="disabled"
        /></template>
        Include unchanged
      </MenuItem>
      <MenuItem
        role="menuitemcheckbox"
        :checked="checked"
        disabled
        :close-on-select="false"
        @click="checked = !checked"
      >
        <template #leading="{ checked, disabled }"
          ><CheckBox presentation :checked="checked" :disabled="disabled"
        /></template>
        Locked option
      </MenuItem>
    </MenuContainer>
  </Menu>
</template>
