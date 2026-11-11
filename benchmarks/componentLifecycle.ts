import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { build, preview } from 'vite';
import { openFixture } from '../tests/browser/fonts';

type TraceEvent = { name: string; ph: string; pid: number; tid: number; ts: number; dur?: number; tdur?: number };

type LifecycleActions = {
  mount: (count: number) => Promise<void>;
  set: (step: number) => Promise<void>;
  unmount: () => void;
  frame: () => Promise<void>;
};

declare global {
  interface Window {
    componentLifecycleBenchmark: LifecycleActions;
  }
}

type LifecycleOptions = {
  root: string;
  variant: string;
  output: string;
  counts: readonly number[];
  mountCycles: number;
  updateCycles: number;
  subject: string;
  sample?: string;
  subjectsPerRoot?: number;
  verifyUpdate?: boolean;
  viewport: { width: number; height: number };
  reducedMotion?: 'reduce';
};

export async function runComponentLifecycle({
  root,
  variant,
  output,
  counts,
  mountCycles,
  updateCycles,
  subject,
  sample = subject,
  subjectsPerRoot = 1,
  verifyUpdate = true,
  viewport,
  reducedMotion,
}: LifecycleOptions) {
  const outDir = await mkdtemp(resolve(tmpdir(), 'm3-component-lifecycle-'));
  const config = { configFile: false as const, root, logLevel: 'error' as const, build: { outDir } };

  try {
    await build(config);
    const server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0 } });
    let browser: Browser | undefined;
    try {
      browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
      const url = new URL('?variant=' + variant, server.resolvedUrls!.local[0]!).href;
      await mkdir(output, { recursive: true });
      const results = [];

      for (const count of counts) {
        for (let round = 0; round < 5; round++) {
          const page = await browser.newPage({ viewport, reducedMotion });
          try {
            await openFixture(page, url);
            await page.evaluate(async (count) => {
              const benchmark = window.componentLifecycleBenchmark;
              for (let i = 0; i < 4; i++) {
                await benchmark.mount(count);
                await benchmark.set(1);
                benchmark.unmount();
              }
              await benchmark.frame();
            }, count);

            const cdp = await page.context().newCDPSession(page);
            const readHeap = async () => {
              await cdp.send('HeapProfiler.collectGarbage');
              await cdp.send('HeapProfiler.collectGarbage');
              return { ...(await cdp.send('Runtime.getHeapUsage')), ...(await cdp.send('Memory.getDOMCounters')) };
            };
            const before = await readHeap();
            const traceEvents: TraceEvent[] = [];
            cdp.on('Tracing.dataCollected', ({ value }) => traceEvents.push(...value));
            const completed = new Promise<void>((done) => cdp.once('Tracing.tracingComplete', () => done()));
            await cdp.send('Tracing.start', {
              categories: 'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline.frame,toplevel,cc',
            });
            const state = await page.evaluate(
              async ({ count, subject, sample, mountCycles, updateCycles }) => {
                const benchmark = window.componentLifecycleBenchmark;
                const fixture = document.querySelector('main')!;
                performance.mark('lifecycle-start');
                for (let i = 0; i < mountCycles; i++) {
                  await benchmark.frame();
                  performance.mark('lifecycle-mount-start');
                  await benchmark.mount(count);
                  fixture.getBoundingClientRect();
                  performance.mark('lifecycle-mount-end');
                  await benchmark.frame();
                  performance.mark('lifecycle-unmount-start');
                  benchmark.unmount();
                  fixture.getBoundingClientRect();
                  performance.mark('lifecycle-unmount-end');
                }
                await benchmark.mount(count);
                const element = fixture.querySelector(sample)!;
                const initial = element.outerHTML;
                let changed = '';
                for (let i = 1; i <= updateCycles; i++) {
                  await benchmark.frame();
                  performance.mark('lifecycle-update-start');
                  await benchmark.set(i);
                  fixture.getBoundingClientRect();
                  performance.mark('lifecycle-update-end');
                  if (i === 1) changed = element.outerHTML;
                }
                await benchmark.frame();
                await benchmark.frame();
                const mounted = fixture.querySelectorAll(subject).length;
                performance.mark('lifecycle-end');
                return { count: mounted, initial, changed, final: element.outerHTML };
              },
              { count, subject, sample, mountCycles, updateCycles },
            );
            assert.equal(state.count, count * subjectsPerRoot);
            if (verifyUpdate) {
              assert.notEqual(state.changed, state.initial);
            }
            assert.equal(state.final, state.initial);
            await cdp.send('Tracing.end');
            await completed;
            const mounted = await readHeap();
            await page.evaluate(() => window.componentLifecycleBenchmark.unmount());
            const after = await readHeap();
            assert.equal(await page.locator(subject).count(), 0);

            const start = traceEvents.find((event) => event.name === 'lifecycle-start');
            const end = traceEvents.find((event) => event.name === 'lifecycle-end');
            assert(start && end);
            const thread = traceEvents.filter(
              (event) => event.pid === start.pid && event.ts >= start.ts && event.ts < end.ts,
            );
            const stages = Object.fromEntries(
              ['mount', 'unmount', 'update'].map((name) => {
                const starts = thread.filter((event) => event.name === `lifecycle-${name}-start`);
                const ends = thread.filter((event) => event.name === `lifecycle-${name}-end`);
                assert.equal(starts.length, name === 'update' ? updateCycles : mountCycles);
                assert.equal(ends.length, starts.length);
                return [name, starts.map((event, i) => (ends[i]!.ts - event.ts) / 1000)];
              }),
            );
            const totals = Object.fromEntries(
              ['ThreadControllerImpl::RunTask', 'UpdateLayoutTree', 'Layout', 'Paint', 'RasterTask'].map((name) => {
                const matches = thread.filter(
                  (event) =>
                    event.ph === 'X' && event.name === name && (name === 'RasterTask' || event.tid === start.tid),
                );
                return [
                  name,
                  {
                    count: matches.length,
                    milliseconds: matches.reduce((sum, event) => sum + (event.tdur ?? event.dur ?? 0), 0) / 1000,
                  },
                ];
              }),
            );
            results.push({ count, round, stages, totals, before, mounted, after });
            await writeFile(resolve(output, `lifecycle-${count}-${round + 1}.json`), JSON.stringify({ traceEvents }));
            console.log(`${variant}: ${count} fixture roots, round ${round + 1}/5`);
          } finally {
            await page.close();
          }
        }
      }
      await writeFile(resolve(output, 'summary.json'), JSON.stringify(results, null, 2) + '\n');
    } finally {
      await browser?.close();
      const closed = once(server.httpServer, 'close');
      server.httpServer.close();
      await closed;
    }
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}
