import { openFixture, loadTestFonts } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage({ viewport: { width: 640, height: 860 }, deviceScaleFactor: 1 });
  await page.addInitScript('window.__name = (fn) => fn');
  const base = new URL('/tests/browser/typography-compact/', server.resolvedUrls!.local[0]).href;
  const output = '.tmp/typography-compact';
  mkdirSync(output, { recursive: true });
  for (const compact of [false, true]) {
    await openFixture(page, base + (compact ? '?compact' : ''));
    const input = page.getByRole('textbox', { name: '名称 / Name', exact: true });
    await input.waitFor();
    assert.equal(await input.evaluate((e) => getComputedStyle(e).fontSize), compact ? '12px' : '16px');
    assert.equal(await input.evaluate((e) => getComputedStyle(e).lineHeight), compact ? '18px' : '24px');
    const button = page.getByRole('button', { name: '应用 Apply', exact: true });
    assert.equal(await button.evaluate((e) => getComputedStyle(e).fontSize), compact ? '12px' : '14px');
    assert.equal(await button.evaluate((e) => e.getBoundingClientRect().height), 32);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize), '16px');
    await page.screenshot({ path: `${output}/${compact ? 'compact' : 'default'}.png`, fullPage: true });
    const select = page.getByRole('combobox');
    await select.focus();
    await select.press('ArrowDown');
    const option = page.getByRole('option').first();
    await option.waitFor();
    // Capture the settled popup, after its entry motion and focus indicator.
    await page.waitForTimeout(600);
    assert.equal(
      await option.locator('[data-part="title"]').evaluate((e) => getComputedStyle(e).fontSize),
      compact ? '12px' : '16px',
    );
    await page.screenshot({ path: `${output}/${compact ? 'compact' : 'default'}-options.png`, fullPage: true });
    await select.press('Escape');
    if (compact) {
      await page.setViewportSize({ width: 380, height: 1000 });
      assert.ok(await page.locator('.panel').evaluate((e) => e.scrollWidth <= e.clientWidth));
      await page.setViewportSize({ width: 640, height: 860 });
      await page.addStyleTag({ content: ':root { --md-sys-typescale-body-large-size: 0.8125rem; }' });
      assert.equal(await input.evaluate((e) => getComputedStyle(e).fontSize), '13px');
    }
  }
  await page.setViewportSize({ width: 1280, height: 860 });
  await openFixture(page, base);
  await page.setContent(
    `<style>body{margin:0;display:flex}iframe{border:0;width:50%;height:860px}</style><iframe src="${base}"></iframe><iframe src="${base}?compact"></iframe>`,
  );
  for (const frame of page.frames().slice(1))
    await frame.getByRole('textbox', { name: '名称 / Name', exact: true }).waitFor();
  for (const frame of page.frames().slice(1)) await loadTestFonts(frame);
  await page.screenshot({ path: `${output}/comparison.png` });
  console.log(`Typography, geometry, dropdowns and consumer overrides passed. Screenshots: ${output}`);
} finally {
  await browser?.close();
  await server?.close();
}
