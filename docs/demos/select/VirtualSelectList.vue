<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { SelectItem, type SelectListSlot } from '@/components/Select';

const props = defineProps<{ list: SelectListSlot }>();
const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.list.entries.length,
    getScrollElement: () => props.list.scrollElement ?? null,
    estimateSize: () => 48,
    getItemKey: (index: number) => props.list.entries[index]!.option.value,
    overscan: 5,
    enabled: props.list.open,
  })),
);
watch(
  () => props.list.setScrollToIndex,
  (register) => {
    register((index) => virtualizer.value.scrollToIndex(index, { align: 'auto' }));
  },
  { immediate: true },
);
onBeforeUnmount(() => props.list.setScrollToIndex(undefined));
</script>

<template>
  <div class="virtual-select-list" :style="{ height: `${virtualizer.getTotalSize()}px` }">
    <SelectItem
      v-for="row in virtualizer.getVirtualItems()"
      :key="list.entries[row.index]!.option.value"
      :ref="
        (instance) => {
          if (instance) virtualizer.measureElement((instance as any).$el);
        }
      "
      :data-index="row.index"
      :index="row.index"
      :option="list.entries[row.index]!.option"
      class="virtual-select-row"
      :style="{ transform: `translateY(${row.start}px)` }"
    />
  </div>
</template>

<style scoped>
.virtual-select-list {
  flex: none;
  position: relative;
  inline-size: 100%;
}
.virtual-select-row {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
}
</style>
