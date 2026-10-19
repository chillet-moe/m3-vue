import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import type { LayoutCase } from './main';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' });
  // tsx preserves names on local functions inside serialized page callbacks.
  await page.addInitScript('window.__name = (fn) => fn');
  await page.goto(new URL('/tests/browser/dialog-spacing/', server.resolvedUrls!.local[0]).href);
  await page.waitForFunction(() => typeof window.__dialogSpacing === 'function');
  const pixel = async (x: number, y: number) => {
    const png = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
    return page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return [...context.getImageData(0, 0, 1, 1).data];
    }, png.toString('base64'));
  };
  let count = 0;
  for (const width of [800, 390]) {
    await page.setViewportSize({ width, height: 600 });
    for (const kind of ['dialog', 'showDialog', 'bottom-sheet', 'side-sheet'] as const) {
      for (const headline of [false, true])
        for (const icon of [false, true])
          for (const actions of [false, true])
            for (const long of [false, true]) {
              if (kind === 'showDialog' && !actions) continue; // This API always supplies actions.
              if (kind === 'side-sheet' && icon) continue;
              const options: LayoutCase = { kind, headline, icon, actions, long };
              await page.evaluate((value) => window.__dialogSpacing(value), options);
              await page.evaluate(async () => {
                await Promise.all(document.getAnimations().map((animation) => animation.finished));
              });
              const measurements = [];
              for (const inset of [8, 0, 16]) {
                const result = await page.evaluate(
                  ({ kind, inset }) => {
                    const root = document.querySelector<HTMLDialogElement>('dialog[open]')!;
                    root.style.setProperty(
                      `--md-${kind === 'showDialog' ? 'dialog' : kind}-content-visual-overflow-inset`,
                      `${inset}px`,
                    );
                    const surface = root.querySelector<HTMLElement>('[data-part="surface"]')!;
                    const content = root.querySelector<HTMLElement>('[data-part="content"]')!;
                    const probe = document.querySelector<HTMLElement>('#body-probe');
                    const textRange = document.createRange();
                    textRange.selectNodeContents(content);
                    const rect = (element: Element | Range) => {
                      const r = element.getBoundingClientRect();
                      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height };
                    };
                    content.scrollTop = 0;
                    const start = rect(probe ?? textRange);
                    const clip = rect(content);
                    content.scrollTop = content.scrollHeight;
                    const end = rect(probe ?? textRange);
                    const children = [...surface.children].map(rect);
                    const surfaceRect = rect(surface);
                    return {
                      modal: root.matches(':modal'),
                      surface: surfaceRect,
                      start,
                      end,
                      clip,
                      top:
                        (content === surface.firstElementChild
                          ? clip.top + parseFloat(getComputedStyle(content).paddingTop)
                          : children[0]!.top + parseFloat(getComputedStyle(surface.firstElementChild!).paddingTop)) -
                        surfaceRect.top,
                      bottom:
                        surfaceRect.bottom -
                        (content === surface.lastElementChild
                          ? content.scrollHeight > content.clientHeight
                            ? end.bottom
                            : rect(content).bottom - parseFloat(getComputedStyle(content).paddingBottom)
                          : children.at(-1)!.bottom -
                            parseFloat(getComputedStyle(surface.lastElementChild!).paddingBottom)),
                      scrolls: content.scrollHeight > content.clientHeight,
                    };
                  },
                  { kind, inset },
                );
                const label = JSON.stringify({ ...options, width, inset });
                assert(result.modal, label);
                assert.equal(
                  result.top,
                  kind === 'bottom-sheet' ? 16 : kind.includes('ialog') && width < 640 ? 20 : 24,
                  `top spacing: ${label}`,
                );
                assert.equal(
                  result.bottom,
                  kind.includes('ialog') && width < 640 ? 20 : 24,
                  `bottom spacing: ${label}`,
                );
                assert.equal(result.scrolls, long, `scrolling: ${label}`);
                if (kind !== 'showDialog') {
                  assert.equal(result.start.top - result.clip.top, inset, `start painting room: ${label}`);
                  if (long || kind !== 'side-sheet')
                    assert.equal(result.clip.bottom - result.end.bottom, inset, `end painting room: ${label}`);
                }
                if (width === 800 && !headline && !icon && !actions) {
                  await page.evaluate(() => {
                    document.querySelector('[data-part="content"]')!.scrollTop = 0;
                  });
                  const shadow = await pixel(result.start.left + 30, result.start.top - 5);
                  const outline = await pixel(result.start.left + 30, result.start.top - 3);
                  assert.equal(shadow.join() === '255,0,0,255', inset > 0, `start shadow: ${label}`);
                  assert.equal(outline.join() === '0,0,255,255', inset > 0, `start outline: ${label}`);
                  if (long) {
                    await page.evaluate(() => {
                      const content = document.querySelector('[data-part="content"]')!;
                      content.scrollTop = content.scrollHeight;
                    });
                    const endShadow = await pixel(result.end.left + 30, result.end.bottom + 4);
                    assert.equal(endShadow.join() === '255,0,0,255', inset > 0, `end shadow: ${label}`);
                  }
                }
                measurements.push(result);
              }
              for (const value of measurements.slice(1)) {
                assert.deepEqual(value.surface, measurements[0]!.surface, `surface size: ${JSON.stringify(options)}`);
                assert.deepEqual(value.start, measurements[0]!.start, `start alignment: ${JSON.stringify(options)}`);
                assert.deepEqual(value.end, measurements[0]!.end, `end alignment: ${JSON.stringify(options)}`);
              }
              count++;
            }
    }
  }
  console.log(`Overlay spacing browser regression passed: ${count} layouts × 3 insets.`);
} finally {
  await browser?.close();
  await server?.close();
}
