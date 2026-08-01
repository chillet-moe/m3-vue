type MemoryWindow = Window &
  typeof globalThis & {
    __actionTooltipBenchmark?: MemoryResult;
    gc?: () => void;
    performance: Performance & { memory?: { usedJSHeapSize: number } };
  };

type MemoryResult = {
  count: number;
  batches: number;
  heapSamplesBytes: number[];
  listenerAdds: number;
  remainingTooltipElements: number;
  remainingAnchoredTriggers: number;
};

const benchmarkWindow = window as MemoryWindow;
const parameters = new URLSearchParams(location.search);
const COUNT = Number(parameters.get('count') ?? 2000);
const BATCHES = Number(parameters.get('batches') ?? 10);
const originalAddEventListener = EventTarget.prototype.addEventListener;
let listenerAdds = 0;

EventTarget.prototype.addEventListener = function (...args: Parameters<EventTarget['addEventListener']>) {
  listenerAdds += 1;
  return originalAddEventListener.apply(this, args);
};

async function collectGarbage() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    benchmarkWindow.gc?.();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
}

async function run() {
  const { actionTitleTooltipAttribute, registerActionTitleTooltip } =
    await import('../../src/internal/actionTitleTooltip');
  const container = document.querySelector('#triggers')!;
  const heapSamplesBytes: number[] = [];

  await collectGarbage();
  const initialHeap = benchmarkWindow.performance.memory?.usedJSHeapSize;
  if (initialHeap !== undefined) heapSamplesBytes.push(initialHeap);

  for (let batch = 0; batch < BATCHES; batch += 1) {
    const fragment = document.createDocumentFragment();
    const cleanups: Array<() => void> = [];
    let firstTrigger: HTMLButtonElement | undefined;

    for (let index = 0; index < COUNT; index += 1) {
      const trigger = document.createElement('button');
      trigger.setAttribute(actionTitleTooltipAttribute, `Action ${batch}-${index}`);
      fragment.appendChild(trigger);
      cleanups.push(registerActionTitleTooltip(trigger));
      firstTrigger ??= trigger;
    }

    container.appendChild(fragment);
    firstTrigger?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

    for (const cleanup of cleanups) cleanup();
    container.replaceChildren();
    await collectGarbage();
    const sample = benchmarkWindow.performance.memory?.usedJSHeapSize;
    if (sample !== undefined) heapSamplesBytes.push(sample);
  }

  const result: MemoryResult = {
    count: COUNT,
    batches: BATCHES,
    heapSamplesBytes,
    listenerAdds,
    remainingTooltipElements: document.querySelectorAll('.m3-tooltip').length,
    remainingAnchoredTriggers: document.querySelectorAll('[style*="anchor-name"]').length,
  };
  benchmarkWindow.__actionTooltipBenchmark = result;
  document.querySelector('#results')!.textContent = JSON.stringify(result, null, 2);
}

void run();
