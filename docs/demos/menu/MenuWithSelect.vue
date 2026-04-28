<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Menu, MenuContainer, MenuDivider, MenuItem, MenuLabel } from '@/components/Menu';
import type { SelectModelValue } from '@/components/Select';
import { Select } from '@/components/Select';
import { vDropdown } from '@/directives/Menu';
import { coffeeOptions } from '../shared/selectOptions';

const menu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const menuBinding = computed(() => menu.value?.menuRef ?? null);
const coffee = ref<SelectModelValue>('espresso');
const coffeeLabel = computed(() => coffeeOptions.find((option) => option.value === coffee.value)?.label ?? 'None');
const action = ref('None');
</script>

<template>
  <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start">
    <Button v-dropdown="menuBinding">Open preferences</Button>

    <Menu
      ref="menu"
      @select="
        (_, item) => {
          action = item.textContent?.trim() ?? 'None';
        }
      "
    >
      <MenuContainer>
        <MenuLabel>Preferences</MenuLabel>

        <div style="padding: 0.5rem 0.75rem 0.75rem; inline-size: min(18rem, calc(100vw - 4rem))">
          <Select v-model="coffee" label="Coffee" :options="coffeeOptions" />
        </div>

        <MenuDivider />

        <MenuItem>
          <template #leading><Icon name="tune" /></template>
          Apply preset
        </MenuItem>
      </MenuContainer>
    </Menu>

    <div>Coffee: {{ coffeeLabel }}</div>
    <div>Action: {{ action }}</div>
  </div>
</template>
