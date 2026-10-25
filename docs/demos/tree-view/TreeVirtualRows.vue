<script setup lang="ts">
import { computed } from 'vue';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/vue-virtual';
import { TreeItem } from '@/components/TreeView';
import type { UseTreeReturn } from '@/composables/useTree';

const props = defineProps<{ tree: UseTreeReturn; scrollElement: HTMLElement | null }>();
const virtualizer = useVirtualizer(
  computed(() => {
    const entries = props.tree.visibleItems.value;
    const focusedIndex = props.tree.visibleIndexes.value.get(props.tree.focusedValue.value ?? '');
    return {
      count: entries.length,
      getScrollElement: () => props.scrollElement,
      estimateSize: () => 32,
      getItemKey: (index: number) => entries[index]!.node.value,
      overscan: 5,
      rangeExtractor: (range: Parameters<typeof defaultRangeExtractor>[0]) => {
        const indexes = defaultRangeExtractor(range);
        if (focusedIndex !== undefined && !indexes.includes(focusedIndex)) indexes.push(focusedIndex);
        return indexes.sort((left, right) => left - right);
      },
    };
  }),
);
function reveal(value: string) {
  const index = props.tree.visibleIndexes.value.get(value);
  if (index !== undefined) virtualizer.value.scrollToIndex(index, { align: 'auto' });
}
defineExpose({ reveal });
</script>

<template>
  <div class="tree-virtual-content" :style="{ height: `${virtualizer.getTotalSize()}px` }" role="presentation">
    <TreeItem
      v-for="row in virtualizer.getVirtualItems()"
      :key="String(row.key)"
      :item="tree.visibleItems.value[row.index]!.node"
      class="tree-virtual-row"
      :style="{ transform: `translateY(${row.start}px)` }"
    />
  </div>
</template>

<style scoped>
.tree-virtual-content {
  position: relative;
  inline-size: 100%;
}
.tree-virtual-row {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  block-size: 32px;
  --md-tree-row-height: 32px;
}
</style>
