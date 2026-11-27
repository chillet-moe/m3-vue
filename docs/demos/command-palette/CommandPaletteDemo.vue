<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { CommandPalette, type CommandPaletteCommand, type CommandPaletteProps } from '@/components/CommandPalette';

const props = defineProps<Omit<CommandPaletteProps, 'commands'>>();
const open = ref(false);
const selected = ref<CommandPaletteCommand>();
const commands: CommandPaletteCommand[] = [
  { id: 'file.save', name: 'Save', group: 'File', icon: 'save', shortcut: '⌘S' },
  { id: 'workspace.save', name: 'Save', group: 'Workspace', icon: 'folder' },
  { id: 'file.save-as', name: 'Save as…', group: 'File', icon: 'save_as' },
  { id: 'editor.settings', name: 'Settings', keywords: ['preferences', 'prefs'], icon: 'settings' },
  { id: 'edit.redo', name: 'Redo', group: 'Edit', icon: 'redo', disabled: true },
];
</script>

<template>
  <div class="palette-demo" @keydown.f3.prevent="open = true">
    <Button @click="open = true">Search commands</Button>
    <output v-if="selected">{{ [selected.group, selected.name].filter(Boolean).join(' / ') }}</output>
    <CommandPalette
      v-bind="props"
      v-model:open="open"
      class="vp-raw"
      :commands="commands"
      @select="selected = $event"
    />
  </div>
</template>

<style scoped>
.palette-demo {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
