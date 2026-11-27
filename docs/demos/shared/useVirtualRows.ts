import { computed, onBeforeUnmount, onMounted, onUpdated, watch, type ComponentPublicInstance } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

type VirtualList<T> = {
  entries: readonly T[];
  open: boolean;
  scrollElement?: HTMLElement | null;
  setScrollToIndex: (callback: ((index: number) => void) | undefined) => void;
};

/** Window variable-height rows inside the scrollport supplied by the list owner. */
export function useVirtualRows<T>(list: () => VirtualList<T>, keyOf: (entry: T) => string | number) {
  const entries = computed(() => list().entries);
  const open = computed(() => list().open);
  const scrollElement = computed(() => list().scrollElement);
  // Virtual row offsets start at the spacer, below the scrollport's top padding.
  const scrollMargin = computed(() => {
    const element = scrollElement.value;
    return element && open.value ? parseFloat(getComputedStyle(element).paddingTop) : 0;
  });
  const virtualizer = useVirtualizer(
    computed(() => {
      const options = entries.value;
      return {
        count: options.length,
        getScrollElement: () => scrollElement.value ?? null,
        scrollMargin: scrollMargin.value,
        estimateSize: () => 48,
        getItemKey: (index: number) => keyOf(options[index]!),
        overscan: 5,
        enabled: open.value,
      };
    }),
  );
  watch(
    () => list().setScrollToIndex,
    (register) => {
      register((index) => virtualizer.value.scrollToIndex(index, { align: 'auto' }));
    },
    { immediate: true },
  );
  onBeforeUnmount(() => list().setScrollToIndex(undefined));

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

  // Measure after the range is inserted and before the active option is scrolled into view on nextTick.
  onMounted(measureRows);
  onUpdated(measureRows);
  return { virtualizer, measureRow, scrollMargin };
}
