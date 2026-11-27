<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { CommandPalette, type CommandPaletteCommand } from '@/components/CommandPalette';
import VirtualCommandList from './VirtualCommandList.vue';

const commands: CommandPaletteCommand[] = Array.from({ length: 3000 }, (_, index) => ({
  id: String(index),
  name: `Editor action ${index + 1}`,
  group: 'Editor',
  icon: 'edit',
  shortcut: index === 0 ? 'Ctrl+K' : undefined,
}));
const open = ref(false);
const selected = ref<CommandPaletteCommand>();
</script>

<template>
  <Button @click="open = true">Search 3,000 commands</Button>
  <output v-if="selected">{{ selected.name }}</output>
  <CommandPalette class="vp-raw" v-model:open="open" :commands="commands" @select="selected = $event">
    <template #list="list"><VirtualCommandList :list="list" /></template>
  </CommandPalette>
</template>
