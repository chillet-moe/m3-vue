import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from 'playwright';
import { build, preview } from 'vite';
import { loadTestFonts } from '../../tests/browser/fonts';
import type {} from './main';

type TraceEvent = {
  name: string;
  ph: string;
  ts: number;
  pid: number;
  tid: number;
  tdur?: number;
};

const root = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.argv[2] ?? '.tmp/date-range-picker');
const workload = process.argv[3] ?? 'selection';
assert(workload === 'selection' || workload === 'model', 'Unknown fixture workload');
const outDir = await mkdtemp(resolve(tmpdir(), 'm3-range-benchmark-'));
const config = { configFile: false as const, root, logLevel: 'error' as const, build: { outDir } };

try {
  await build(config);
  const server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0 } });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({
      executablePath: process.env.HEADLESS_SHELL,
      args: ['--run-all-compositor-stages-before-draw', '--disable-lcd-text'],
    });
    const connection = await browser.newBrowserCDPSession();
    const rounds = [];
    await mkdir(output, { recursive: true });

    for (let round = 0; round < 5; round++) {
      const context = await browser.newContext({ viewport: { width: 1000, height: 780 }, deviceScaleFactor: 1 });
      try {
        const {
          browserContextIds: [browserContextId],
        } = await connection.send('Target.getBrowserContexts');
        const pagePromise = context.waitForEvent('page');
        await connection.send('Target.createTarget', {
          browserContextId,
          url: 'about:blank',
          enableBeginFrameControl: true,
        });
        const page = await pagePromise;
        const cdp = await context.newCDPSession(page);
        await cdp.send('Performance.enable');
        await page.goto(new URL(`?workload=${workload}`, server.resolvedUrls!.local[0]!).href);
        const timestamp = (await cdp.send('Performance.getMetrics')).metrics.find(
          (metric) => metric.name === 'Timestamp',
        );
        assert(timestamp);
        const interval = 1000 / 60;
        let time = timestamp.value * 1000;
        const frame = async () => {
          time += interval;
          await cdp.send('HeadlessExperimental.beginFrame', { frameTimeTicks: time, interval });
        };
        await frame();
        const fonts = loadTestFonts(page);
        for (let i = 0; i < 4; i++) await frame();
        await fonts;
        if (workload === 'selection') {
          await page
            .getByRole('button', { name: 'Open calendar' })
            .evaluate((button: HTMLButtonElement) => button.click());
          for (let i = 0; i < 32; i++) await frame();
          assert(await page.locator('#calendar').evaluate((element) => element.matches(':popover-open')));
        }

        const traceEvents: TraceEvent[] = [];
        cdp.on('Tracing.dataCollected', ({ value }) => traceEvents.push(...value));
        const completed = new Promise<void>((done) => cdp.once('Tracing.tracingComplete', () => done()));
        await cdp.send('Tracing.start', {
          categories: 'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline',
        });
        await page.evaluate(() => performance.mark('range-start'));
        if (workload === 'model') {
          for (let i = 0; i < 12; i++) {
            await page.evaluate((start) => window.setRangeBenchmarkStart(start), i % 2 ? '2026-04-13' : '2026-04-12');
            await frame();
          }
        } else {
          for (const date of [12, 16, 13, 19, 12, 16, 13, 19, 12, 16, 13, 19]) {
            const day = page.locator(`#calendar [data-part="day"][data-date="2026-04-${date}"]`).first();
            await day.evaluate((button: HTMLButtonElement) => button.click());
            await frame();
            await frame();
          }
        }
        await page.evaluate(() => performance.mark('range-end'));
        await cdp.send('Tracing.end');
        await completed;
        await writeFile(resolve(output, `trace-${round + 1}.json`), JSON.stringify({ traceEvents }));

        const startDay = '[data-part="day"][data-selected-start="true"][data-date="2026-04-13"]';
        if (workload === 'model') {
          assert.equal(await page.locator('[id^=calendar-]:popover-open').count(), 0);
          assert.equal(await page.locator(`[id^=calendar-]:has(${startDay})`).count(), 24);
        } else {
          assert.equal(await page.locator(`#calendar ${startDay}`).count(), 1);
          assert.equal(
            await page
              .locator('#calendar [data-part="day"][data-selected-end="true"]')
              .first()
              .getAttribute('data-date'),
            '2026-04-19',
          );
        }
        const start = traceEvents.find((event) => event.name === 'range-start');
        const end = traceEvents.find((event) => event.name === 'range-end');
        assert(start && end);
        const events = traceEvents.filter(
          (event) => event.ph === 'X' && event.pid === start.pid && event.ts >= start.ts && event.ts < end.ts,
        );
        rounds.push(
          Object.fromEntries(
            ['RunTask', 'UpdateLayoutTree', 'Layout', 'Paint', 'RasterTask'].map((name) => {
              const stage = events.filter(
                (event) => event.name === name && (name === 'RasterTask' || event.tid === start.tid),
              );
              const cpuMs = stage.reduce((total, event) => total + (event.tdur ?? 0), 0) / 1000;
              return [name, { count: stage.length, cpuMs }];
            }),
          ),
        );
      } finally {
        await context.close();
      }
    }

    console.log(JSON.stringify({ output, rounds }, null, 2));
  } finally {
    await browser?.close();
    await new Promise<void>((done) => server.httpServer.close(() => done()));
  }
} finally {
  await rm(outDir, { recursive: true, force: true });
}
