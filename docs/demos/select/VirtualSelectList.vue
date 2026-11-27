<script setup lang="ts">
import { SelectItem, type SelectListSlot } from '@/components/Select';
import { useVirtualRows } from '../shared/useVirtualRows';

const props = defineProps<{ list: SelectListSlot }>();
const { virtualizer, measureRow, scrollMargin } = useVirtualRows(
  () => props.list,
  (entry) => entry.option.value,
);
</script>

<template>
  <div class="virtual-list" :style="{ height: `${virtualizer.getTotalSize()}px` }">
    <SelectItem
      v-for="row in virtualizer.getVirtualItems()"
      :key="list.entries[row.index]!.option.value"
      :ref="measureRow"
      :data-index="row.index"
      :index="row.index"
      :option="list.entries[row.index]!.option"
      class="virtual-row"
      :style="{ transform: `translateY(${row.start - scrollMargin}px)` }"
    />
  </div>
</template>

<style scoped src="../shared/virtualRows.css"></style>
