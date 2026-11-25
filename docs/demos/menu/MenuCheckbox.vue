<script setup lang="ts">
import { ref } from 'vue';
import { Button, Menu, MenuContainer, MenuItem, vDropdown } from '@/index';

const menu = ref<InstanceType<typeof Menu>>();
const includeUnchanged = ref(false);
</script>

<template>
  <Button v-dropdown="menu?.menuRef">View options</Button>
  <Menu ref="menu">
    <MenuContainer>
      <MenuItem
        role="menuitemcheckbox"
        :checked="includeUnchanged"
        :close-on-select="false"
        @click="includeUnchanged = !includeUnchanged"
      >
        Include unchanged
      </MenuItem>
      <MenuItem role="menuitemcheckbox" checked disabled :close-on-select="false"> Include required </MenuItem>
    </MenuContainer>
  </Menu>
</template>
