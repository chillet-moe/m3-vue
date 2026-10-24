<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type ComponentPublicInstance } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { SelectItem } from '@/components/Select';
import type { SelectListSlot } from '@/composables/useSelect';

const props = defineProps<{ list: SelectListSlot }>();
const viewport = ref<HTMLDivElement>();
const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.list.entries.length,
    getScrollElement: () => viewport.value ?? null,
    getItemKey: (index: number) => props.list.entries[index]!.option.value,
    estimateSize: () => 36,
    overscan: 4,
    enabled: props.list.open,
  })),
);
const rows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());
function measure(instance: Element | ComponentPublicInstance | null) {
  const element = instance && ('$el' in instance ? instance.$el : instance);
  virtualizer.value.measureElement(element as HTMLElement | null);
}
watch(
  () => props.list.open,
  (open) => {
    if (open) {
      virtualizer.value.measure();
      props.list.setScrollToIndex((index) => virtualizer.value.scrollToIndex(index, { align: 'auto' }));
    }
  },
  { immediate: true, flush: 'post' },
);
onBeforeUnmount(() => props.list.setScrollToIndex(undefined));
</script>

<template>
  <div ref="viewport" class="virtual-viewport" data-testid="virtual-viewport">
    <div class="virtual-content" :style="{ height: `${totalSize}px` }">
      <div
        v-for="row in rows"
        :key="String(row.key)"
        :ref="measure"
        :data-index="row.index"
        class="virtual-row"
        :style="{ transform: `translateY(${row.start}px)` }"
      >
        <SelectItem
          v-bind="list.optionProps(row.index)"
          :selected="list.isOptionSelected(list.entries[row.index]!.option)"
          :active="list.activeIndex === row.index"
          :disabled="list.entries[row.index]!.option.disabled"
          class="virtual-option"
        >
          {{ list.entries[row.index]!.option.label }}
        </SelectItem>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-viewport {
  overflow: auto;
  block-size: min(240px, calc(100dvb - 6rem));
  overscroll-behavior: contain;
}
.virtual-content {
  position: relative;
  inline-size: 100%;
}
.virtual-row {
  position: absolute;
  inset: 0 0 auto;
  padding: 0 4px;
  box-sizing: border-box;
}
</style>
