import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
let browser;
try {
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage();
  await page.addInitScript('window.__name = (fn) => fn');
  await openFixture(page, new URL('/tests/browser/menu-checkbox/', server.resolvedUrls!.local[0]).href);
  await page.getByRole('button', { name: 'Options', exact: true }).click();
  const row = page.getByRole('menuitemcheckbox', { name: 'Include unchanged' });
  const command = page.getByRole('menuitem', { name: 'Command', exact: true });
  const height = (locator: typeof row) => locator.evaluate((el) => (el as HTMLElement).offsetHeight);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await height(row), await height(command), 'Presentation checkbox must not enlarge the menu row');
  const root = page.locator('[data-scope="menu"][data-part="root"]').filter({ has: row });
  const indicator = row.locator('[data-scope="checkbox"][data-part="root"]');
  for (const size of ['extra-small', 'small', 'medium', 'large', 'extra-large']) {
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Row size' }).selectOption(size);
    await page.getByRole('button', { name: 'Options', exact: true }).click();
    for (const density of [-4, -2, 0, 2]) {
      await root.evaluate((el, value) => (el as HTMLElement).style.setProperty('--md-density', String(value)), density);
      assert.equal(await height(row), await height(command), size + ' density ' + density);
      assert.equal(await height(indicator), 18);
      assert.equal(await height(page.getByTestId('standalone')), 40);
    }
  }
  await root.evaluate((el) => {
    const style = (el as HTMLElement).style;
    style.setProperty('--md-menus-menu-item-height', '60px');
    style.setProperty('--md-menus-menu-item-top-space', '10px');
    style.setProperty('--md-menus-menu-item-bottom-space', '10px');
    style.setProperty('--md-checkbox-target-size', '72px');
  });
  assert.equal(await height(row), 60);
  assert.equal(await height(indicator), 18, 'Standalone target token must not enlarge presentation');
  await indicator.evaluate((el) => (el as HTMLElement).style.setProperty('--md-checkbox-container-size', '48px'));
  assert.equal(await height(indicator), 48);
  assert.equal(await height(row), 68, 'Explicit visible box grows the row without clipping');
  await indicator.evaluate((el) => (el as HTMLElement).style.removeProperty('--md-checkbox-container-size'));
  await page
    .getByTestId('standalone')
    .evaluate((el) => (el as HTMLElement).style.setProperty('--md-checkbox-target-size', '52px'));
  assert.equal(await height(page.getByTestId('standalone')), 52);
  assert.equal(await row.locator('input, button, [tabindex]').count(), 0, 'No nested focus target');
  await row.click();
  assert.equal(await row.getAttribute('aria-checked'), 'true');
  assert.equal(await indicator.getAttribute('data-checked'), 'true');
  await row.press('Space');
  assert.equal(await row.getAttribute('aria-checked'), 'false');
  await row.press('Enter');
  assert.equal(await row.getAttribute('aria-checked'), 'true');
  const disabled = page.getByRole('menuitemcheckbox', { name: 'Locked option' });
  await disabled.click({ force: true });
  assert.equal(await disabled.getAttribute('aria-checked'), 'true');
  assert.equal(
    await disabled.locator('[data-scope="checkbox"][data-part="root"]').getAttribute('data-disabled'),
    'true',
  );
  await row.focus();
  await row.press('ArrowDown');
  assert.equal(await command.evaluate((el) => el === document.activeElement), true, 'Navigation skips disabled option');
  await page.keyboard.press('Escape');
  await root.waitFor({ state: 'hidden' });
  const list = page.getByRole('checkbox', { name: 'List selection' });
  await list.click();
  assert.equal(await list.getAttribute('aria-checked'), 'false');
  assert.equal(await list.locator('input').count(), 0);
  assert.equal(await list.locator('[data-scope="checkbox"][data-part="root"]').getAttribute('data-checked'), 'false');

  await page.getByRole('button', { name: 'Sort by', exact: true }).click();
  const name = page.getByRole('menuitemradio', { name: 'Name', exact: true });
  const modified = page.getByRole('menuitemradio', { name: 'Modified', exact: true });
  const radio = name.locator('[data-scope="radio"][data-part="root"]');
  assert.equal(await height(name), 48, 'Presentation radio must not enlarge the menu row');
  assert.equal(await height(radio), 20);
  const standaloneRadio = page.getByTestId('standalone-radio');
  assert.equal(await height(standaloneRadio), 40);
  await radio.evaluate((el) => (el as HTMLElement).style.setProperty('--md-radio-target-size', '64px'));
  assert.equal(await height(name), 48, 'Standalone radio target token does not add menu spacing');
  await radio.evaluate((el) => (el as HTMLElement).style.setProperty('--md-radio-icon-size', '32px'));
  assert.equal(await height(name), 56, 'Explicit radio circle size grows the row');
  await radio.evaluate((el) => (el as HTMLElement).style.removeProperty('--md-radio-icon-size'));
  await standaloneRadio.evaluate((el) => (el as HTMLElement).style.setProperty('--md-radio-target-size', '52px'));
  assert.equal(await height(standaloneRadio), 52);
  assert.equal(await name.locator('input, button, [tabindex]').count(), 0);
  assert.equal(await name.getAttribute('aria-checked'), 'true');
  await modified.focus();
  await modified.press('Enter');
  await modified.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Sort by', exact: true }).click();
  assert.equal(await name.getAttribute('aria-checked'), 'false');
  assert.equal(await modified.getAttribute('aria-checked'), 'true');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Visible columns', exact: true }).click();
  const size = page.getByRole('menuitemcheckbox', { name: 'Size', exact: true });
  const column = page.getByRole('menuitemcheckbox', { name: 'Modified', exact: true });
  assert.equal(await size.getAttribute('aria-checked'), 'true');
  await column.click();
  assert.equal(await column.getAttribute('aria-checked'), 'true');
  assert.equal(await size.getAttribute('aria-checked'), 'true');
  await column.press('Space');
  assert.equal(await column.getAttribute('aria-checked'), 'false');
  await page.keyboard.press('Escape');
  console.log(
    'Menu selection: checkbox/radio geometry, public tokens, standalone targets, ListItem, model-driven demos, keyboard and disabled semantics passed.',
  );
} finally {
  await browser?.close();
  await server.close();
}
