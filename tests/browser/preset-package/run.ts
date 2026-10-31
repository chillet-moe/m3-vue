// Run after pnpm build: exercise public package exports and preserved CSS side effects.
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { build, preview } from 'vite';
import { chromium } from 'playwright';
const outDir = await mkdtemp(resolve(tmpdir(), 'm3-preset-consumer-'));
const root = resolve('tests/browser/preset-package');
try {
  await build({ configFile: false, root, logLevel: 'error', build: { outDir, emptyOutDir: true } });
  const server = await preview({ configFile: false, root, build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
  try {
    const page = await browser.newPage();
    await page.goto(server.resolvedUrls.local[0]);
    await page.locator('[data-scope="switch"][data-part="root"]').waitFor();
    const actual = await page.evaluate(() => ({
      density: getComputedStyle(document.documentElement).getPropertyValue('--md-density').trim(),
      font: getComputedStyle(document.querySelector('[data-scope="switch"][data-part="label"]')!).fontSize,
      switchSize: document.querySelector('[data-scope="switch"][data-part="root"]')!.getAttribute('data-size'),
      buttonSize: document.querySelector('[data-scope="icon-button"][data-part="root"]')!.getAttribute('data-size'),
      fieldSize: document.querySelector('[data-scope="text-field"][data-part="root"]')!.getAttribute('data-size'),
    }));
    assert.deepEqual(actual, {
      density: '-2',
      font: '12px',
      switchSize: 'small',
      buttonSize: 'extra-small',
      fieldSize: 'small',
    });
    assert.equal(await page.getByRole('textbox', { name: 'Name' }).count(), 1);
    assert.equal(await page.locator('[data-scope="text-field"] label, [data-scope="text-field"] legend').count(), 0);
    console.log('Published compact entry imports its CSS and installs complete component defaults.');
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
  }
} finally {
  await rm(outDir, { recursive: true, force: true });
}
