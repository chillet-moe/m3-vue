import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Locator } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 700 } });
  await page.addInitScript('window.__name = fn => fn');
  await openFixture(page, new URL('/tests/browser/field-hover/', server.resolvedUrls!.local[0]).href);
  const appearance = (field: Locator) =>
    field.evaluate(async (root) => {
      await Promise.all(root.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
      const outline = getComputedStyle(root.querySelector('[data-part="outline"]')!);
      const label = getComputedStyle(root.querySelector('[data-part="label"]')!);
      return { width: outline.borderTopWidth, color: outline.borderTopColor, label: label.color };
    });
  const firstField = page.getByTestId('field-0');
  await firstField.evaluate((el: HTMLElement) => el.style.setProperty('--md-control-outline-color', 'red'));
  const tinted = await appearance(firstField);
  assert.match(tinted.color, /^color\(srgb 1 0 0 \/ 0\.\d+\)$/);
  await firstField.evaluate((el: HTMLElement) => el.style.setProperty('--md-button-outlined-outline-color', 'blue'));
  assert.equal((await appearance(firstField)).color, 'rgb(0, 0, 255)');
  await firstField.evaluate((el: HTMLElement) =>
    el.style.setProperty('--md-outlined-text-field-outline-color', 'green'),
  );
  assert.equal((await appearance(firstField)).color, 'rgb(0, 128, 0)');
  await firstField.evaluate((el: HTMLElement) => {
    el.style.removeProperty('--md-control-outline-color');
    el.style.removeProperty('--md-button-outlined-outline-color');
    el.style.removeProperty('--md-outlined-text-field-outline-color');
  });

  for (const invalid of [false, true]) {
    await page.locator('#invalid').setChecked(invalid);
    for (const index of [0, 1, 2]) {
      const field = page.getByTestId(`field-${index}`);
      const container = field.locator('[data-scope="text-field"][data-part="container"]');
      const input = field.locator('[data-part="input"]');
      await page.mouse.move(1150, 650);
      const idle = await appearance(field);
      await input.hover();
      const hover = await appearance(field);
      assert.notDeepEqual(hover, idle, `field ${index}: visible hover feedback`);
      for (const part of ['leading', 'trailing']) {
        await field.locator(`[data-scope="text-field"][data-part="${part}"]`).hover();
        assert.deepEqual(await appearance(field), hover, `field ${index}: ${part} hover`);
      }
      await container.hover({ position: { x: 4, y: 28 } });
      assert.deepEqual(await appearance(field), hover, `field ${index}: container padding hover`);
      await field.locator('[data-scope="text-field"][data-part="supporting"]').hover();
      assert.deepEqual(await appearance(field), idle, `field ${index}: supporting text excluded`);
      await input.focus();
      const focused = await appearance(field);
      await container.hover({ position: { x: 4, y: 28 } });
      assert.deepEqual(await appearance(field), focused, `field ${index}: focus takes precedence`);
      await input.evaluate((el) => (el as HTMLElement).blur());
    }
  }
  for (const toggle of ['disabled', 'native-disabled']) {
    await page.locator(`#${toggle}`).check();
    for (const index of [0, 1, 2]) {
      const field = page.getByTestId(`field-${index}`);
      await page.mouse.move(1150, 650);
      const idle = await appearance(field);
      await field.locator('[data-scope="text-field"][data-part="container"]').hover();
      assert.deepEqual(await appearance(field), idle, `field ${index}: ${toggle} has no hover`);
    }
    await page.locator(`#${toggle}`).uncheck();
  }
  console.log('TextField, Select and Combobox whole-container hover, error, focus and disabled checks passed.');
} finally {
  await browser.close();
  await server.close();
}
