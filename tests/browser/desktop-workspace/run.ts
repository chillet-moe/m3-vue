import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, new URL('/tests/browser/desktop-workspace/', server.resolvedUrls!.local[0]).href, {
    waitUntil: 'networkidle',
  });
  const group = page.getByRole('checkbox', { name: 'Export channels' });
  assert.equal(await group.getAttribute('aria-checked'), 'mixed');
  await group.click();
  assert.equal(await group.isChecked(), true);
  const slider = page.locator('.m3-slider').first();
  assert.equal(await slider.locator('[data-part="track-active"]').count(), 1);
  const geometry = await slider.evaluate((element) => {
    const track = element.querySelector('.m3-slider-track')!;
    const thumb = element.querySelector('.m3-slider-handle')!;
    return [
      element.getBoundingClientRect().height,
      track.getBoundingClientRect().height,
      thumb.getBoundingClientRect().width,
      thumb.getBoundingClientRect().height,
    ];
  });
  [32, 4, 16, 16].forEach((expected, index) => {
    assert(Math.abs(geometry[index]! - expected) < 0.01);
  });
  mkdirSync('/tmp/m3-desktop-previews', { recursive: true });
  await page.screenshot({ path: '/tmp/m3-desktop-previews/light.png' });
  await page.evaluate(() => {
    document.documentElement.style.colorScheme = 'dark';
  });
  await page.screenshot({ path: '/tmp/m3-desktop-previews/dark.png' });
  await page.screenshot({
    path: '/tmp/m3-desktop-previews/panel.png',
    clip: { x: 20, y: 20, width: 320, height: 560 },
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.screenshot({ path: '/tmp/m3-desktop-previews/narrow.png' });
  const standard = page.getByTestId('standard-item');
  const expressive = page.getByTestId('expressive-item');
  assert.equal(await standard.evaluate((el) => getComputedStyle(el, '::before').transitionDuration), '0s');
  assert.notEqual(await expressive.evaluate((el) => getComputedStyle(el, '::before').transitionDuration), '0s');
  await standard.hover();
  await page.mouse.down();
  assert.equal(await standard.getAttribute('data-pressed'), 'false');
  await page.mouse.up();
  await expressive.hover();
  await page.mouse.down();
  assert.equal(await expressive.getAttribute('data-pressed'), 'true');
  await page.mouse.up();
  assert.deepEqual(errors, []);
  console.log('Desktop workspace: mixed checkbox, slider geometry, item appearance and screenshots passed.');
} finally {
  await browser.close();
  await server.close();
}
