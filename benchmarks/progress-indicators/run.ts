import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type JSHandle } from 'playwright';
import { build, preview } from 'vite';

type TraceEvent = {
  name: string;
  ph: string;
  ts: number;
  pid: number;
  tid: number;
  tdur?: number;
};

const root = fileURLToPath(new URL('.', import.meta.url));
const kind = process.argv[2] ?? 'loading';
assert(
  kind === 'loading' || kind === 'linear' || kind === 'circular' || kind === 'linear-indeterminate',
  'Expected loading, linear, circular, or linear-indeterminate',
);
const output = resolve(process.argv[3] ?? `.tmp/progress-indicators/${kind}`);
const outDir = await mkdtemp(resolve(tmpdir(), 'm3-progress-benchmark-'));
const resizes = kind === 'linear';
const linearAnimation = kind === 'linear-indeterminate';
const visibility = process.env.LINEAR_VISIBILITY ?? 'visible';
const shape = process.env.LINEAR_SHAPE ?? 'flat';
const deferSkip = linearAnimation && process.env.LINEAR_DEFER_SKIP === '1';
const pinPhase = linearAnimation && process.env.LINEAR_PIN_PHASE === '1';
assert(!linearAnimation || ['visible', 'offscreen', 'visibility-hidden', 'display-none'].includes(visibility));
assert(!linearAnimation || shape === 'flat' || shape === 'wavy');
assert(!pinPhase || (visibility === 'visible' && !deferSkip), 'Phase control requires the visible scenario');
const counts = resizes || linearAnimation ? [1, 60] : [1, 100];
const animationFrames = pinPhase ? 120 : linearAnimation ? 80 : 144;
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

    for (const count of counts)
      for (let round = 0; round < 5; round++) {
        const context = await browser.newContext({
          viewport: { width: 1000, height: 780 },
          deviceScaleFactor: 1,
          reducedMotion: 'no-preference',
        });
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
          const url = new URL(`?kind=${kind}&count=${count}`, server.resolvedUrls!.local[0]!);
          if (linearAnimation) {
            url.searchParams.set('visibility', visibility);
            url.searchParams.set('shape', shape);
            if (deferSkip) url.searchParams.set('defer-skip', '');
          }
          await page.goto(url.href);
          const timestamp = (await cdp.send('Performance.getMetrics')).metrics.find(
            (metric) => metric.name === 'Timestamp',
          );
          assert(timestamp);
          const interval = 1000 / 60;
          let time = timestamp.value * 1000;
          let phase = 0;
          let pinned: JSHandle<Animation[]> | undefined;
          const frame = async (screenshot = false) => {
            if (pinned) {
              phase += interval;
              await pinned.evaluate((animations, phase) => {
                for (const animation of animations) animation.currentTime = phase;
              }, phase);
            }
            time += interval;
            return cdp.send('HeadlessExperimental.beginFrame', {
              frameTimeTicks: time,
              interval,
              ...(screenshot && { screenshot: { format: 'png' } }),
            });
          };
          for (let i = 0; i < 8; i++) await frame();
          const progressBars = linearAnimation ? page.locator('[role="progressbar"]') : page.getByRole('progressbar');
          assert.equal(await progressBars.count(), count);
          if (pinPhase) {
            pinned = await page.evaluateHandle((count) => {
              const segments = document.querySelectorAll('[data-part="active-indicator"]');
              if (segments.length !== count * 2) throw new Error('Expected two active segments per indicator');

              return Array.from(segments).flatMap((segment) => {
                const animations = segment.getAnimations();
                if (!animations.length) throw new Error('Expected an animation on every active segment');

                for (const animation of animations) animation.pause();
                return animations;
              });
            }, count);
          }
          const readStates = () =>
            progressBars.evaluateAll((roots) =>
              roots.map((root) => ({
                semantics: [
                  root.getAttribute('aria-label'),
                  root.getAttribute('aria-hidden'),
                  root.getAttribute('aria-valuenow'),
                ],
                paths: [...root.querySelectorAll('path')].map((path) => [path.getAttribute('d'), path.style.transform]),
              })),
            );
          const before = linearAnimation ? undefined : await readStates();

          const traceEvents: TraceEvent[] = [];
          cdp.on('Tracing.dataCollected', ({ value }) => traceEvents.push(...value));
          const completed = new Promise<void>((done) => cdp.once('Tracing.tracingComplete', () => done()));
          await cdp.send('Tracing.start', {
            categories: 'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline',
          });
          await page.evaluate(() => performance.mark('progress-start'));
          if (resizes) {
            const host = page.locator('main');
            for (let i = 1; i <= 24; i++) {
              await host.evaluate(
                (element, width) => {
                  element.style.width = `${width}px`;
                },
                748.5 - i * 11.125,
              );
              await frame();
            }
            await frame();
            await frame();
          } else {
            for (let i = 0; i < animationFrames; i++) await frame();
          }
          await page.evaluate(() => performance.mark('progress-end'));
          await cdp.send('Tracing.end');
          await completed;
          await writeFile(resolve(output, `trace-${count}-${round + 1}.json`), JSON.stringify({ traceEvents }));

          let revealed;
          if (linearAnimation) {
            await page.locator('main').evaluate((host, visibility) => {
              if (visibility === 'offscreen') window.scrollTo(0, host.getBoundingClientRect().top + window.scrollY);
              else if (visibility === 'visibility-hidden') host.style.visibility = '';
              else if (visibility === 'display-none') host.style.display = 'flex';
            }, visibility);
            for (let i = 1; i <= 4; i++) {
              const { screenshotData } = await frame(true);
              assert(screenshotData);
              await writeFile(
                resolve(output, `reveal-${count}-${round + 1}-${i}.png`),
                Buffer.from(screenshotData, 'base64'),
              );
            }
            revealed = await progressBars.first().evaluate((root) => {
              const parts = Array.from(root.querySelectorAll('[data-part="active-indicator"]'));
              return parts.map((part) => ({
                clip: getComputedStyle(part).clipPath,
                times: part.getAnimations().map((animation) => animation.currentTime),
              }));
            });
            assert.equal(revealed.length, 2);
            assert(revealed.every(({ clip, times }) => clip.startsWith('inset(') && times.length > 0));
          } else {
            assert(before);
            const after = await readStates();
            assert.deepEqual(
              after.map((state) => state.semantics),
              before.map((state) => state.semantics),
            );
            assert(after.every((state, index) => JSON.stringify(state.paths) !== JSON.stringify(before[index]!.paths)));
            if (kind === 'loading') {
              assert(after.every((state) => JSON.stringify(state.paths) === JSON.stringify(after[0]!.paths)));
            }
          }
          const start = traceEvents.find((event) => event.name === 'progress-start');
          const end = traceEvents.find((event) => event.name === 'progress-end');
          assert(start && end);
          const events = traceEvents.filter(
            (event) => event.ph === 'X' && event.pid === start.pid && event.ts >= start.ts && event.ts < end.ts,
          );
          if (!resizes && !linearAnimation) {
            assert.equal(
              events.filter((event) => event.tid === start.tid && event.name === 'FireAnimationFrame').length,
              animationFrames,
            );
          }
          rounds.push({
            count,
            round,
            ...(revealed && { revealed }),
            stages: Object.fromEntries(
              ['RunTask', 'FireAnimationFrame', 'UpdateLayoutTree', 'Layout', 'Paint', 'RasterTask'].map((name) => {
                const stage = events.filter(
                  (event) => event.name === name && (name === 'RasterTask' || event.tid === start.tid),
                );
                const cpuMs = stage.reduce((total, event) => total + (event.tdur ?? 0), 0) / 1000;
                return [name, { count: stage.length, cpuMs }];
              }),
            ),
          });
        } finally {
          await context.close();
        }
      }

    console.log(
      JSON.stringify(
        { kind, output, ...(linearAnimation && { visibility, shape, deferSkip, pinPhase }), rounds },
        null,
        2,
      ),
    );
  } finally {
    await browser?.close();
    await new Promise<void>((done) => server.httpServer.close(() => done()));
  }
} finally {
  await rm(outDir, { recursive: true, force: true });
}
