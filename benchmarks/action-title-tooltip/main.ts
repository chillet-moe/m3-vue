import { createApp, h, nextTick, ref, type App } from 'vue';

type MemoryInfo = {
  usedJSHeapSize: number;
};

type BenchmarkWindow = Window &
  typeof globalThis & {
    __actionTooltipBenchmark?: BenchmarkResult;
    gc?: () => void;
    performance: Performance & { memory?: MemoryInfo };
  };

type BenchmarkResult = {
  count: number;
  recycleRounds: number;
  mountMs: number;
  updateMs: number;
  recycleMs: number;
  unmountMs: number;
  listenerAdds: number;
  tooltipElementsAfterMount: number;
  anchoredTriggersAfterMount: number;
  tooltipElementsAfterRecycle: number;
  heapBeforeBytes?: number;
  heapAfterRecycleBytes?: number;
  heapAfterUnmountBytes?: number;
  heapStabilitySamplesBytes: number[];
};

const benchmarkWindow = window as BenchmarkWindow;
const COUNT = Number(new URLSearchParams(location.search).get('count') ?? 2000);
const RECYCLE_ROUNDS = Number(new URLSearchParams(location.search).get('recycleRounds') ?? 5);
const MEMORY_BATCHES = Number(new URLSearchParams(location.search).get('memoryBatches') ?? 3);
const WITH_TITLES = new URLSearchParams(location.search).get('withTitles') !== 'false';
let listenerAdds = 0;
const originalAddEventListener = EventTarget.prototype.addEventListener;

EventTarget.prototype.addEventListener = function (...args: Parameters<EventTarget['addEventListener']>) {
  listenerAdds += 1;
  return originalAddEventListener.apply(this, args);
};

const now = () => performance.now();
const heap = () => benchmarkWindow.performance.memory?.usedJSHeapSize;

async function collectGarbage() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    benchmarkWindow.gc?.();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
}

async function run() {
  const [{ default: Button }, { default: FloatingActionButton }, { default: IconButton }] = await Promise.all([
    import('../../src/components/Button/Button.vue'),
    import('../../src/components/FloatingActionButton/FloatingActionButton.vue'),
    import('../../src/components/IconButton/IconButton.vue'),
  ]);
  const version = ref(0);
  const offset = ref(0);
  let app: App<Element> | undefined;

  await collectGarbage();
  const heapBeforeBytes = heap();
  const listenersBeforeMount = listenerAdds;
  const mountStart = now();

  app = createApp({
    setup() {
      return () =>
        h(
          'div',
          Array.from({ length: COUNT }, (_, logicalIndex) => {
            const index = logicalIndex + offset.value;
            const common = {
              key: index,
              ...(WITH_TITLES ? { title: `Action ${index} v${version.value}` } : undefined),
            };

            if (index % 3 === 0) {
              return h(IconButton, { ...common, icon: 'settings' });
            }
            if (index % 3 === 1) {
              return h(Button, common, { default: () => `Action ${index}` });
            }
            return h(FloatingActionButton, { ...common, icon: 'edit' });
          }),
        );
    },
  });
  app.mount('#app');
  await nextTick();
  const mountMs = now() - mountStart;
  const tooltipElementsAfterMount = document.querySelectorAll('.m3-tooltip').length;
  const anchoredTriggersAfterMount = document.querySelectorAll('[style*="anchor-name"]').length;

  const updateStart = now();
  version.value += 1;
  await nextTick();
  const updateMs = now() - updateStart;

  const recycleStart = now();
  for (let round = 0; round < RECYCLE_ROUNDS; round += 1) {
    offset.value += COUNT;
    await nextTick();
  }
  const recycleMs = now() - recycleStart;
  await collectGarbage();
  const heapAfterRecycleBytes = heap();
  const heapStabilitySamplesBytes = heapAfterRecycleBytes === undefined ? [] : [heapAfterRecycleBytes];
  const tooltipElementsAfterRecycle = document.querySelectorAll('.m3-tooltip').length;
  const listenerAddsAfterTimedWork = listenerAdds - listenersBeforeMount;

  for (let batch = 0; batch < MEMORY_BATCHES; batch += 1) {
    for (let round = 0; round < RECYCLE_ROUNDS; round += 1) {
      offset.value += COUNT;
      await nextTick();
    }
    await collectGarbage();
    const sample = heap();
    if (sample !== undefined) heapStabilitySamplesBytes.push(sample);
  }

  const unmountStart = now();
  app.unmount();
  await nextTick();
  const unmountMs = now() - unmountStart;
  await collectGarbage();

  const result: BenchmarkResult = {
    count: COUNT,
    recycleRounds: RECYCLE_ROUNDS,
    mountMs,
    updateMs,
    recycleMs,
    unmountMs,
    listenerAdds: listenerAddsAfterTimedWork,
    tooltipElementsAfterMount,
    anchoredTriggersAfterMount,
    tooltipElementsAfterRecycle,
    heapBeforeBytes,
    heapAfterRecycleBytes,
    heapAfterUnmountBytes: heap(),
    heapStabilitySamplesBytes,
  };

  benchmarkWindow.__actionTooltipBenchmark = result;
  document.querySelector('#results')!.textContent = JSON.stringify(result, null, 2);
}

void run();
