<script setup lang="ts">
import { computed, inject, type ComponentPublicInstance } from 'vue';
import { Icon } from '@/components/Icon';
import { vStateLayer } from '@/components/StateLayer/state-layer';
import { commandPaletteItemKey } from './commandPaletteList';
import type { CommandPaletteCommand } from './commandSearch';

export type CommandPaletteItemProps = {
  /** Command from the palette's current result set. Key the row by its stable ID. */
  command: CommandPaletteCommand;
  /** Zero-based index in the complete result set. */
  index: number;
};

const props = defineProps<CommandPaletteItemProps>();
const palette = inject(commandPaletteItemKey);
if (!palette) throw new Error('CommandPaletteItem must be rendered inside CommandPalette.');
const { activeId, setRow } = palette;
const active = computed(() => props.command.id === activeId.value);
function bindRow(element: Element | ComponentPublicInstance | null) {
  setRow(props.command.id, element as HTMLElement | null);
}
</script>

<template>
  <div
    :id="palette.optionId(command.id)"
    :ref="bindRow"
    v-state-layer
    class="palette-option m3-state-layer"
    data-scope="command-palette"
    data-part="option"
    :data-last="index + 1 === palette.count.value ? 'true' : undefined"
    role="option"
    :aria-selected="active"
    :aria-posinset="index + 1"
    :aria-setsize="palette.count.value"
    :aria-disabled="command.disabled || undefined"
    @mousedown.prevent
    @click="palette.execute(command)"
  >
    <Icon v-if="command.icon" :name="command.icon" aria-hidden="true" />
    <span class="palette-name" data-scope="command-palette" data-part="name">{{ command.name }}</span>
    <span v-if="command.group" class="palette-group" data-scope="command-palette" data-part="group">{{
      command.group
    }}</span>
    <kbd v-if="command.shortcut" class="palette-shortcut" data-scope="command-palette" data-part="shortcut">{{
      command.shortcut
    }}</kbd>
  </div>
</template>

<style scoped src="./CommandPaletteItem.css"></style>
