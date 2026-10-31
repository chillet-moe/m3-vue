import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage();
  await openFixture(page, new URL('/tests/browser/field-labels/', server.resolvedUrls!.local[0]).href);
  for (let index = 0; index < 3; index++) {
    const role = index === 0 ? 'textbox' : 'combobox';
    const native = page.getByRole(role, { name: `Native ${index}`, exact: true });
    await page.locator(`label[for="native-${index}"]`).click();
    assert(await native.evaluate((el) => el === document.activeElement));
    await page.keyboard.press('Escape');
    const custom = page.getByRole(role, { name: `Custom ${index}`, exact: true });
    assert.equal(await custom.count(), 1);
    const hidden = page.getByRole(role, { name: `Hidden ${index}`, exact: true });
    assert.equal(await hidden.count(), 1);
    const root = hidden.locator('xpath=ancestor::*[@data-scope="text-field" and @data-part="root"]');
    assert.equal(await root.locator('label, legend').count(), 0);
    assert.equal(await root.evaluate((el) => getComputedStyle(el).marginBlockStart), '0px');
    assert.equal(await page.getByRole(role, { name: `Floating ${index}`, exact: true }).count(), 1);
  }
  await page.getByRole('button', { name: 'Toggle labels' }).click();
  for (let index = 0; index < 3; index++) {
    const control = page.getByRole(index === 0 ? 'textbox' : 'combobox', { name: `Hidden ${index}`, exact: true });
    assert.equal(await control.getAttribute('aria-label'), null);
    const root = control.locator('xpath=ancestor::*[@data-scope="text-field" and @data-part="root"]');
    assert.equal(await root.locator('legend').textContent(), `Hidden ${index}`);
  }
  console.log('Field labels: native and custom names, focus, clearance and reactive overrides passed');
} finally {
  await browser.close();
  await server.close();
}
