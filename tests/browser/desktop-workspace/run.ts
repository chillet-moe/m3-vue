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
  await page.goto(new URL('/tests/browser/desktop-workspace/', server.resolvedUrls!.local[0]).href, {
    waitUntil: 'networkidle',
  });
  const single = page.getByRole('combobox', { name: 'Layer', exact: true });
  await single.click();
  const popup = page.locator('[role="listbox"]:popover-open');
  await popup.getByRole('option', { name: 'Layer 9998', exact: true }).waitFor();
  assert((await popup.getByRole('option').count()) < 40);
  const itemMotion = await popup
    .getByRole('option')
    .first()
    .evaluate((element) => ({
      appearance: element.getAttribute('data-appearance'),
      scope: element.getAttribute('data-scope'),
      duration: getComputedStyle(element, '::before').transitionDuration,
      width: getComputedStyle(element, '::before').width,
      rowWidth: element.getBoundingClientRect().width,
    }));
  assert.equal(itemMotion.scope, 'select-item');
  assert.equal(itemMotion.appearance, 'standard');
  assert.equal(itemMotion.duration, '0s');
  assert(Math.abs(parseFloat(itemMotion.width) - itemMotion.rowWidth) < 1);
  await single.press('Home');
  await page.waitForFunction(() =>
    document.querySelector('input[role="combobox"]:focus')?.getAttribute('aria-activedescendant')?.endsWith('number-1'),
  );
  await single.press('End');
  await page.waitForFunction(() =>
    document
      .querySelector('input[role="combobox"]:focus')
      ?.getAttribute('aria-activedescendant')
      ?.endsWith('number-9999'),
  );
  await single.press('Enter');
  assert.equal(await single.inputValue(), 'Layer 9999');
  await single.click();
  await single.press('ArrowUp');
  await single.press('Enter');
  assert.equal(await single.inputValue(), 'Layer 9998');
  await single.click();
  await popup.locator('[data-testid="virtual-viewport"]').evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.waitForFunction(
    () => !document.querySelector('input[role="combobox"]:focus')?.hasAttribute('aria-activedescendant'),
  );
  assert.equal(await single.evaluate((element) => element.ownerDocument.activeElement === element), true);
  await single.press('Escape');
  const multi = page.getByRole('combobox', { name: 'Linked layers', exact: true });
  await multi.click();
  await multi.press('End');
  await multi.press('Enter');
  assert.equal(await multi.getAttribute('aria-expanded'), 'true');
  await multi.press('Tab');
  assert.equal(await multi.getAttribute('aria-expanded'), 'false');
  const search = page.getByRole('combobox', { name: 'Search layers', exact: true });
  assert.equal(await search.inputValue(), 'Layer 9998');
  await search.fill('Layer 800');
  await popup.getByRole('option', { name: 'Layer 800', exact: true }).waitFor();
  await search.press('Escape');
  assert.equal(await search.inputValue(), 'Layer 9998');
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
  await multi.click();
  await multi.press('End');
  await page.screenshot({ path: '/tmp/m3-desktop-previews/dark.png' });
  await page.screenshot({
    path: '/tmp/m3-desktop-previews/panel.png',
    clip: { x: 20, y: 20, width: 320, height: 560 },
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.screenshot({ path: '/tmp/m3-desktop-previews/narrow.png' });
  const scrollRegions = await popup.evaluate(
    (root) =>
      [...root.querySelectorAll<HTMLElement>('*')].filter((element) => {
        const style = getComputedStyle(element);
        return ['auto', 'scroll'].includes(style.overflowY) && element.scrollHeight > element.clientHeight;
      }).length,
  );
  assert.equal(scrollRegions, 1, 'Only the virtual viewport should scroll');
  assert((await popup.getByRole('option').count()) < 40);
  await multi.press('Escape');
  await page.getByRole('checkbox', { name: 'Simulate search error' }).check();
  await search.click();
  await page.getByText('Search unavailable', { exact: true }).waitFor();
  assert.equal(await search.getAttribute('aria-invalid'), 'true');
  await search.press('Escape');
  await page.getByRole('checkbox', { name: 'Simulate search error' }).uncheck();
  await search.fill('no-such-layer');
  await popup.getByText('No layers found', { exact: true }).waitFor();
  assert.equal(await popup.getByRole('option').count(), 0);
  await search.fill('Layer 900');
  await popup.getByRole('option', { name: 'Layer 900', exact: true }).waitFor();
  await search.press('Home');
  await search.press('Enter');
  assert.equal(await search.inputValue(), 'Layer 900');
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
  console.log('Desktop workspace: virtual navigation, focus, query, mixed checkbox, geometry and screenshots passed.');
} finally {
  await browser.close();
  await server.close();
}
