import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { build, preview } from 'vite';
import { openFixture } from '../../tests/browser/fonts';
import type {} from './main';

const output = resolve(process.argv[2] ?? '.tmp/state-layer/memory');
const outDir = await mkdtemp(resolve(tmpdir(), 'm3-state-layer-memory-'));
const config = { configFile: false as const, root: import.meta.dirname, logLevel: 'error' as const, build: { outDir } };

try {
  await build(config);
  const server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0 } });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
    const results = [];
    for (const count of [80, 400]) {
      for (let round = 0; round < 5; round++) {
        const page = await browser.newPage({
          viewport: { width: 1000, height: 780 },
          reducedMotion: count === 400 ? 'reduce' : 'no-preference',
        });
        try {
          await openFixture(page, server.resolvedUrls!.local[0]!);
          const cdp = await page.context().newCDPSession(page);
          const readHeap = async () => {
            await cdp.send('HeapProfiler.collectGarbage');
            await cdp.send('HeapProfiler.collectGarbage');
            return { ...(await cdp.send('Runtime.getHeapUsage')), ...(await cdp.send('Memory.getDOMCounters')) };
          };

          // Keep cleanup timers paused until every active ripple has been sampled.
          const epoch = Date.UTC(2026, 0, 1);
          await page.clock.install({ time: epoch });
          await page.clock.pauseAt(epoch + 1000);
          await page.evaluate((count) => window.mountStateLayerBenchmark(count), count);
          const buttons = page.getByRole('button');
          await buttons.first().evaluate((button) => button.getBoundingClientRect());
          assert.equal(await buttons.count(), count);
          const ripples = page.locator('.ripple');
          assert.equal(await ripples.count(), 0);
          const mounted = await readHeap();

          await buttons.evaluateAll((nodes) => {
            for (const button of nodes) {
              button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            }
          });
          assert.equal(await ripples.count(), count);
          const active = await readHeap();
          assert.equal(await ripples.count(), count);
          await page.clock.runFor(1300);
          assert.equal(await ripples.count(), 0);
          const settled = await readHeap();

          const result = {
            count,
            round,
            mounted,
            active,
            settled,
            activeKiB: (active.usedSize - mounted.usedSize) / 1024,
            settledKiB: (settled.usedSize - mounted.usedSize) / 1024,
          };
          results.push(result);
          console.log(JSON.stringify(result));
        } finally {
          await page.close();
        }
      }
    }
    await mkdir(output, { recursive: true });
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
