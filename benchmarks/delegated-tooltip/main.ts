import { createApp, h, nextTick, ref, withDirectives, type App } from 'vue';
import Tooltip from '../../src/components/Tooltip/Tooltip.vue';
import vTooltip from '../../src/directives/Tooltip/vTooltip';
import { useDelegatedTooltip } from '../../src/composables/useDelegatedTooltip';

type Mode = 'delegated' | 'per-instance';

type BenchmarkResult = {
  mode: Mode;
  count: number;
  recycleRounds: number;
  mountMs: number;
  recycleMs: number;
  unmountMs: number;
  listenerAdds: number;
  tooltipElementsAfterMount: number;
  anchoredTriggersAfterMount: number;
  tooltipElementsAfterRecycle: number;
  describedbyTriggersAfterRecycle: number;
};

type BenchmarkWindow = Window & {
  __delegatedTooltipBenchmark?: BenchmarkResult[];
};

const benchmarkWindow = window as BenchmarkWindow;
const parameters = new URLSearchParams(location.search);
const COUNT = Number(parameters.get('count') ?? 1000);
const RECYCLE_ROUNDS = Number(parameters.get('recycleRounds') ?? 3);
let listenerAdds = 0;
const originalAddEventListener = EventTarget.prototype.addEventListener;

EventTarget.prototype.addEventListener = function (...args: Parameters<EventTarget['addEventListener']>) {
  listenerAdds += 1;
  return originalAddEventListener.apply(this, args);
};

const now = () => performance.now();

async function runMode(mode: Mode): Promise<BenchmarkResult> {
  const offset = ref(0);
  let controls: { offset: typeof offset } | undefined;
  let app: App<Element> | undefined;
  const listenersBefore = listenerAdds;
  const mountStart = now();

  app = createApp({
    setup() {
      const container = ref<HTMLDivElement>();
      controls = { offset };
      const delegated =
        mode === 'delegated'
          ? useDelegatedTooltip(
              container,
              'benchmark-delegated-tooltip',
              (anchor) => anchor.dataset.tooltip ?? null,
              (target) => {
                if (!(target instanceof Element)) {
                  return null;
                }
                return target.closest<HTMLElement>('[data-tooltip]');
              },
              3,
            )
          : undefined;

      return () => {
        const children: ReturnType<typeof h>[] = [];
        for (let logicalIndex = 0; logicalIndex < COUNT; logicalIndex += 1) {
          const index = logicalIndex + offset.value;
          const tooltip = `Item ${index}`;
          const button = h(
            'button',
            {
              key: `trigger-${index}`,
              'data-tooltip': tooltip,
            },
            `Item ${index}`,
          );

          if (mode === 'delegated') {
            children.push(button);
            continue;
          }

          const tooltipId = `benchmark-per-instance-tooltip-${index}`;
          children.push(
            withDirectives(button, [
              [
                vTooltip,
                {
                  target: `#${tooltipId}`,
                  interactive: false,
                  triggerAria: 'describedby',
                  popoverType: 'hint',
                },
              ],
            ]),
            h(Tooltip, { id: tooltipId, key: tooltipId, popover: 'hint' }, () => tooltip),
          );
        }

        if (delegated) {
          for (const slot of delegated.tooltipSlots) {
            children.push(h(Tooltip, { id: slot.id, key: slot.id, popover: 'hint' }, () => slot.tooltip ?? ''));
          }
        }

        return h('div', { ref: container }, children);
      };
    },
  });

  const host = document.createElement('div');
  document.querySelector('#app')!.appendChild(host);
  app.mount(host);
  await nextTick();
  const mountMs = now() - mountStart;
  const tooltipElementsAfterMount = document.querySelectorAll('.m3-tooltip').length;
  const anchoredTriggersAfterMount = document.querySelectorAll('[style*="anchor-name"]').length;

  const firstTrigger = host.querySelector<HTMLElement>('[data-tooltip]');
  firstTrigger?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  await nextTick();
  await nextTick();

  const recycleStart = now();
  for (let round = 0; round < RECYCLE_ROUNDS; round += 1) {
    controls!.offset.value += COUNT;
    await nextTick();
  }
  const recycleMs = now() - recycleStart;
  const tooltipElementsAfterRecycle = document.querySelectorAll('.m3-tooltip').length;
  const describedbyTriggersAfterRecycle = document.querySelectorAll('[aria-describedby]').length;

  const unmountStart = now();
  app.unmount();
  await nextTick();
  const unmountMs = now() - unmountStart;

  return {
    mode,
    count: COUNT,
    recycleRounds: RECYCLE_ROUNDS,
    mountMs,
    recycleMs,
    unmountMs,
    listenerAdds: listenerAdds - listenersBefore,
    tooltipElementsAfterMount,
    anchoredTriggersAfterMount,
    tooltipElementsAfterRecycle,
    describedbyTriggersAfterRecycle,
  };
}

const results = [await runMode('delegated'), await runMode('per-instance')];
benchmarkWindow.__delegatedTooltipBenchmark = results;
document.querySelector('#results')!.textContent = JSON.stringify(results, null, 2);
