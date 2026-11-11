<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, watch, type ComponentPublicInstance } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { SelectItem, type SelectListSlot } from '@/components/Select';

const props = defineProps<{ list: SelectListSlot }>();
const entries = computed(() => props.list.entries);
const open = computed(() => props.list.open);
const virtualizer = useVirtualizer(
  computed(() => {
    const options = entries.value;
    return {
      count: options.length,
      getScrollElement: () => props.list.scrollElement ?? null,
      estimateSize: () => 48,
      getItemKey: (index: number) => options[index]!.option.value,
      overscan: 5,
      enabled: open.value,
    };
  }),
);
watch(
  () => props.list.setScrollToIndex,
  (register) => {
    register((index) => virtualizer.value.scrollToIndex(index, { align: 'auto' }));
  },
  { immediate: true },
);
onBeforeUnmount(() => props.list.setScrollToIndex(undefined));

const pendingMeasurements = new Set<Element>();
function measureRow(instance: Element | ComponentPublicInstance | null) {
  if (!instance) return;

  const row = '$el' in instance ? (instance.$el as Element) : instance;
  pendingMeasurements.add(row);
}

function measureRows() {
  if (open.value) {
    for (const row of pendingMeasurements) {
      if (row.isConnected) virtualizer.value.measureElement(row);
    }
  }
  pendingMeasurements.clear();
}

// Measure after the range is inserted and before Select scrolls to the active option on nextTick.
onMounted(measureRows);
onUpdated(measureRows);
</script>

<template>
  <div class="virtual-select-list" :style="{ height: `${virtualizer.getTotalSize()}px` }">
    <SelectItem
      v-for="row in virtualizer.getVirtualItems()"
      :key="list.entries[row.index]!.option.value"
      :ref="measureRow"
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
