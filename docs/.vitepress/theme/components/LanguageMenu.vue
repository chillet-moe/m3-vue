<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { useData, withBase } from 'vitepress';
import { IconButton, Menu, MenuContainer, MenuItem, vDropdown } from '@/index';
import { useLocaleNavigation } from '../composables/nav';

const { theme } = useData();
const { languages } = useLocaleNavigation();
const menu = useTemplateRef<InstanceType<typeof Menu>>('menu');
const dropdown = computed(() => menu.value?.menuRef ?? null);
</script>

<template>
  <template v-if="languages.length > 1">
    <IconButton
      v-dropdown="dropdown"
      icon="translate"
      variant="standard"
      size="small"
      :aria-label="theme.langMenuLabel || 'Change language'"
    />
    <Menu ref="menu" size="small" :aria-label="theme.langMenuLabel || 'Change language'">
      <MenuContainer>
        <MenuItem
          v-for="language in languages"
          :key="language.key"
          :href="withBase(language.link)"
          :lang="language.lang"
          :hreflang="language.lang"
          :dir="language.dir"
          rel="alternate"
          :selected="language.current"
          :aria-current="language.current ? 'true' : undefined"
        >
          {{ language.label }}
        </MenuItem>
      </MenuContainer>
    </Menu>
  </template>
</template>
