import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { openFixture } from '../fonts';

// Start the documentation site with pnpm run docs:dev.
const base = process.env.DOCS_URL ?? 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, `${base}/guides/field-layout`);
  const lab = page.locator('.floating-label-spacing-lab');
  const grid = lab.locator('.floating-label-spacing-lab__grid');
  const measure = () =>
    grid.evaluate((el) => {
      const style = getComputedStyle(el);
      const field = el.firstElementChild!;
      return {
        row: style.rowGap,
        column: style.columnGap,
        columns: style.gridTemplateColumns.split(' ').length,
        height: field.getBoundingClientRect().height,
        margin: getComputedStyle(field).marginBlockStart,
      };
    });
  const initial = await measure();
  assert.equal(initial.row, '16px');
  assert.equal(initial.column, '16px');
  assert.equal(initial.margin, '0px');
  assert(initial.columns >= 2);

  await lab.getByRole('textbox', { name: 'Row gap', exact: true }).fill('24px');
  await lab.getByRole('textbox', { name: 'Column gap', exact: true }).fill('12px');
  const spaced = await measure();
  assert.equal(spaced.row, '24px');
  assert.equal(spaced.column, '12px');
  assert.equal(spaced.height, initial.height);
  assert.equal(spaced.margin, initial.margin);

  await lab.getByRole('spinbutton', { name: 'Density', exact: true }).fill('-2');
  const dense = await measure();
  assert(dense.height < spaced.height);
  assert.equal(dense.row, spaced.row);
  assert.equal(dense.column, spaced.column);

  await lab.getByRole('textbox', { name: 'Label clearance', exact: true }).fill('8px');
  const cleared = await measure();
  assert.equal(cleared.margin, '8px');
  assert.equal(cleared.height, dense.height);
  assert.equal(cleared.row, dense.row);
  assert.equal(cleared.column, dense.column);

  // Clearing a local override restores the inherited token, independently for each axis.
  await page.evaluate(() => document.documentElement.style.setProperty('--md-field-row-gap', '20px'));
  await lab.getByRole('textbox', { name: 'Row gap', exact: true }).fill('');
  assert.equal((await measure()).row, '20px');
  assert.equal((await measure()).column, '12px');

  mkdirSync('.tmp/field-layout', { recursive: true });
  await lab.scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.tmp/field-layout/desktop.png', animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await grid.scrollIntoViewIfNeeded();
  assert.equal((await measure()).columns, 1);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: '.tmp/field-layout/mobile.png', animations: 'disabled' });
  assert.deepEqual(errors, []);
  console.log(
    'Field layout: inherited gap tokens, independent axes, density, label clearance and responsive preview passed.',
  );
} finally {
  await browser.close();
}
