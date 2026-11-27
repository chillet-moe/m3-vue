<script setup lang="ts">
import { CommandPaletteItem, type CommandPaletteListSlot } from '@/components/CommandPalette';
import { useVirtualRows } from '../shared/useVirtualRows';

const props = defineProps<{ list: CommandPaletteListSlot }>();
const { virtualizer, measureRow, scrollMargin } = useVirtualRows(
  () => props.list,
  (entry) => entry.id,
);
</script>

<template>
  <div class="virtual-list" :style="{ height: `${virtualizer.getTotalSize()}px` }">
    <CommandPaletteItem
      v-for="row in virtualizer.getVirtualItems()"
      :key="list.entries[row.index]!.id"
      :ref="measureRow"
      :data-index="row.index"
      :index="row.index"
      :command="list.entries[row.index]!"
      class="virtual-row"
      :style="{ transform: `translateY(${row.start - scrollMargin}px)` }"
    />
  </div>
</template>

<style scoped src="../shared/virtualRows.css"></style>
