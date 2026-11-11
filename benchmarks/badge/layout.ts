import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { build, preview } from 'vite';
import { loadTestFonts } from '../../tests/browser/fonts';
import type {} from '../componentLifecycle';

type TraceEvent = {
  name: string;
  ph: string;
  pid: number;
  tid: number;
  ts: number;
  dur?: number;
  tdur?: number;
};

const output = resolve(process.argv[2] ?? '.tmp/badge/layout');
const outDir = await mkdtemp(resolve(tmpdir(), 'm3-badge-layout-'));
const config = {
  configFile: false as const,
  root: import.meta.dirname,
  logLevel: 'error' as const,
  build: { outDir },
};

try {
  await build(config);
  const server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0 } });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({
      executablePath: process.env.HEADLESS_SHELL,
      args: ['--run-all-compositor-stages-before-draw'],
    });
    const connection = await browser.newBrowserCDPSession();
    const results = [];
    await mkdir(output, { recursive: true });

    for (const count of [3, 320]) {
      for (let round = 0; round < 5; round++) {
        const context = await browser.newContext({
          viewport: { width: 1000, height: 760 },
          reducedMotion: 'reduce',
        });
        try {
          const {
            browserContextIds: [browserContextId],
          } = await connection.send('Target.getBrowserContexts');
          const ready = context.waitForEvent('page');
          await connection.send('Target.createTarget', {
            url: 'about:blank',
            browserContextId,
            enableBeginFrameControl: true,
          });
          const page = await ready;
          const cdp = await context.newCDPSession(page);
          await cdp.send('Performance.enable');
          await page.goto(new URL('?variant=tabs', server.resolvedUrls!.local[0]!).href);

          const timestamp = (await cdp.send('Performance.getMetrics')).metrics.find(
            (metric) => metric.name === 'Timestamp',
          );
          assert(timestamp);
          let time = timestamp.value * 1000;
          const interval = 1000 / 60;
          const frame = async () => {
            time += interval;
            await cdp.send('HeadlessExperimental.beginFrame', { frameTimeTicks: time, interval });
          };

          await frame();
          const fonts = loadTestFonts(page);
          for (let i = 0; i < 4; i++) await frame();
          await fonts;
          await page.evaluate((count) => window.componentLifecycleBenchmark.mount(count), count);
          for (let i = 0; i < 5; i++) await frame();

          const badges = page.locator('[data-scope="badge"][data-part="root"]');
          const indicator = page.locator('[data-scope="tabs"][data-part="indicator"]');
          const width = () =>
            indicator.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--_tabs-indicator-inline-size'));
          const set = (step: number) => page.evaluate((step) => window.componentLifecycleBenchmark.set(step), step);
          const initialWidth = await width();
          assert(initialWidth);
          assert.equal(await badges.count(), count);
          await set(1);
          await frame();
          await frame();
          assert.equal(await badges.first().getAttribute('aria-label'), '99+');
          assert.notEqual(await width(), initialWidth);
          await set(0);
          await frame();
          await frame();
          assert.equal(await width(), initialWidth);

          const traceEvents: TraceEvent[] = [];
          cdp.on('Tracing.dataCollected', ({ value }) => traceEvents.push(...value));
          const complete = new Promise<void>((done) => cdp.once('Tracing.tracingComplete', () => done()));
          await cdp.send('Tracing.start', { categories: 'devtools.timeline,blink.user_timing,toplevel,cc' });
          await page.evaluate(() => performance.mark('badge-layout-start'));
          for (let step = 1; step <= 24; step++) {
            await set(step);
            // Let TabList make the first geometry read for this update.
            await frame();
          }
          await frame();
          await frame();
          await page.evaluate(() => performance.mark('badge-layout-end'));
          await cdp.send('Tracing.end');
          await complete;
          assert.equal(await badges.first().getAttribute('aria-label'), '8');
          assert.equal(await width(), initialWidth);
          assert.equal(await page.getByRole('tab').first().getAttribute('aria-selected'), 'true');

          const start = traceEvents.find((event) => event.name === 'badge-layout-start');
          const end = traceEvents.find((event) => event.name === 'badge-layout-end');
          assert(start && end);
          const events = traceEvents.filter(
            (event) => event.pid === start.pid && event.ph === 'X' && event.ts >= start.ts && event.ts < end.ts,
          );
          const main = events.filter((event) => event.tid === start.tid);
          const byName = (name: string) => main.filter((event) => event.name === name);
          const layout = byName('Layout');
          const script = main.filter((event) =>
            [
              'FunctionCall',
              'EvaluateScript',
              'RunMicrotasks',
              'EventDispatch',
              'FireAnimationFrame',
              'TimerFire',
            ].includes(event.name),
          );
          const synchronous = layout.filter((layout) =>
            script.some((task) => task.ts <= layout.ts && task.ts + (task.dur ?? 0) >= layout.ts + (layout.dur ?? 0)),
          );
          const measure = (rows: TraceEvent[]) => ({
            count: rows.length,
            milliseconds: rows.reduce((total, event) => total + (event.tdur ?? event.dur ?? 0), 0) / 1000,
          });
          const row = {
            count,
            round,
            layout: measure(layout),
            synchronousLayout: measure(synchronous),
            style: measure(byName('UpdateLayoutTree')),
            paint: measure(byName('Paint')),
            raster: measure(events.filter((event) => event.name === 'RasterTask')),
          };
          results.push(row);
          await writeFile(resolve(output, `badge-layout-${count}-${round + 1}.json`), JSON.stringify({ traceEvents }));
          console.log(JSON.stringify(row));
        } finally {
          await context.close();
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
