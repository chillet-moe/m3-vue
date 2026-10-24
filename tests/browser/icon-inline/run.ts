import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage();
  await page.addInitScript('window.__name = (fn) => fn');
  await page.goto(new URL('/tests/browser/icon-inline/', server.resolvedUrls!.local[0]).href);
  await page.locator('.text-case').first().waitFor();
  const offsets = await page.evaluate(() => {
    const center = (element: Element) => {
      const box = element.getBoundingClientRect();
      return box.y + box.height / 2;
    };
    return {
      text: [...document.querySelectorAll('.text-case')].map(
        (element) =>
          center(element.querySelector('[data-scope="icon"]')!) - center(element.querySelector('.text-center')!),
      ),
      containers: [...document.querySelectorAll('.centered-case')].map(
        (element) => center(element.querySelector('[data-scope="icon"]')!) - center(element),
      ),
      buttons: [...document.querySelectorAll('.button-case')].map(
        (element) =>
          center(element.querySelector('[data-scope="icon"]')!) - center(element.querySelector('[data-part="text"]')!),
      ),
      standalone: getComputedStyle(document.querySelector('.standalone')!).verticalAlign,
    };
  });
  assert.equal(offsets.text.length, 12);
  for (const [kind, values] of Object.entries(offsets)) {
    if (typeof values === 'string') continue;
    for (const offset of values) assert.ok(Math.abs(offset) < 0.1, `${kind}: unexpected center offset ${offset}px`);
  }
  assert.equal(offsets.standalone, 'baseline');
  console.log('Inline Icon text, size override, flex/grid, Button, and standalone alignment passed.');
} finally {
  await browser?.close();
  await server?.close();
}
