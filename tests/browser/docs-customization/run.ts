import assert from 'node:assert/strict';
import { chromium, type Locator } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { openFixture } from '../fonts';

// Start the documentation site with pnpm run docs:dev before running this check.
const base = process.env.DOCS_URL ?? 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.addInitScript('window.__name = (fn) => fn');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, `${base}/components/button`);
  await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
  await page.getByRole('button', { name: 'Disable sticky preview', exact: true }).click();
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Customize', exact: true });
  const choosePreset = (container: Locator, name: string) =>
    container
      .locator('[data-scope="button"][data-part="root"]')
      .filter({ has: page.getByRole('radio', { name, exact: true }) })
      .click();
  await panel.waitFor();
  assert.equal(await panel.getAttribute('data-scope'), 'popover');
  assert(await panel.getByRole('radio', { name: 'Default', exact: true }).isChecked());
  await choosePreset(panel, 'Compact');
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--md-density') === '-2');
  assert(await panel.getByRole('radio', { name: 'Compact', exact: true }).isChecked());
  await panel.getByRole('spinbutton', { name: 'Density', exact: true }).fill('3');
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--md-density') === '3');
  assert.equal(await panel.getByRole('radio', { checked: true }).count(), 0);
  await panel.getByRole('textbox', { name: 'Field row gap', exact: true }).fill('24px');
  await panel.getByRole('textbox', { name: 'Field column gap', exact: true }).fill('12px');
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--md-field-row-gap') === '24px');
  const fieldGaps = await panel
    .locator('.customization-fields')
    .first()
    .evaluate((el) => ({ row: getComputedStyle(el).rowGap, column: getComputedStyle(el).columnGap }));
  assert.deepEqual(fieldGaps, { row: '24px', column: '12px' });
  await panel.getByRole('tab', { name: 'Typography', exact: true }).click();
  await choosePreset(panel, 'Compact');
  await page.waitForFunction(
    () =>
      getComputedStyle(document.documentElement).getPropertyValue('--md-sys-typescale-body-large-size').trim() ===
      '0.75rem',
  );
  assert(await panel.getByRole('radio', { name: 'Compact', exact: true }).isChecked());
  await panel.getByRole('textbox', { name: 'Size', exact: true }).fill('13px');
  assert.equal(await panel.getByRole('radio', { checked: true }).count(), 0);
  await panel.getByRole('tab', { name: 'Shapes', exact: true }).click();
  assert.equal(await panel.getByRole('radio').count(), 0);
  const originalRadius = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--md-shape-action'),
  );
  const radius = panel.getByRole('slider', { name: 'Actions Radius', exact: true });
  const radiusBox = await radius.boundingBox();
  assert(radiusBox);
  await page.mouse.move(radiusBox.x + radiusBox.width * 0.5, radiusBox.y + radiusBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(radiusBox.x + radiusBox.width * 0.7, radiusBox.y + radiusBox.height / 2);
  await page.waitForFunction(
    (original) => getComputedStyle(document.documentElement).getPropertyValue('--md-shape-action') !== original,
    originalRadius,
  );
  await page.mouse.up();
  assert.equal(await panel.getByRole('radio', { checked: true }).count(), 0);
  const fullSwitch = panel
    .locator('[data-scope="switch"][data-part="root"]')
    .filter({ has: page.getByRole('checkbox', { name: 'Full', exact: true }) });
  await fullSwitch.click();
  assert.equal(await panel.getByRole('checkbox', { name: 'Full', exact: true }).isChecked(), false);
  await fullSwitch.click();
  assert(await panel.getByRole('checkbox', { name: 'Full', exact: true }).isChecked());
  await page.waitForFunction(
    () => document.documentElement.style.getPropertyValue('--md-shape-indicator') === '9999px',
  );
  await panel.getByRole('tab', { name: 'Components', exact: true }).click();
  await panel.getByLabel('Row size', { exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'extra-small', exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'extra-small', exact: true }).waitFor({ state: 'hidden' });
  await panel.getByLabel('Button size', { exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'extra-small', exact: true }).click();
  assert(await panel.isVisible(), 'Nested option popover should keep the customization open');
  await panel.getByRole('tab', { name: 'Code', exact: true }).click();
  const setupCode = panel.locator('.customization-code').first();
  assert((await setupCode.textContent())?.includes('themes/compact.css'));
  assert((await setupCode.textContent())?.includes('"size": "extra-small"'));
  assert((await setupCode.textContent())?.includes('"rowSize": "extra-small"'));
  assert((await panel.locator('.customization-code').last().textContent())?.includes('--md-density: 3;'));
  const cssCode = await panel.locator('.customization-code').last().textContent();
  assert(cssCode?.includes('--md-field-row-gap: 24px;'));
  assert(cssCode?.includes('--md-field-column-gap: 12px;'));
  assert(cssCode?.includes('row-gap: var(--md-field-row-gap);'));
  assert(cssCode?.includes('column-gap: var(--md-field-column-gap);'));
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await panel.getByRole('button', { name: 'Copy', exact: true }).first().click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await setupCode.textContent());
  mkdirSync('.tmp/docs-customization', { recursive: true });
  await page.screenshot({ path: '.tmp/docs-customization/code.png' });
  await panel.getByRole('tab', { name: 'Theme', exact: true }).click();
  await panel.evaluate(async (el) => {
    await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
  });
  await page.screenshot({ path: '.tmp/docs-customization/desktop.png' });
  await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'hidden' });
  assert(
    await page.getByRole('button', { name: 'Customize', exact: true }).evaluate((el) => el === document.activeElement),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Customize', exact: true }).waitFor();
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--md-density') === '3');
  assert.equal(
    await page.evaluate(() => JSON.parse(localStorage.getItem('m3-vue-docs-theme')!).defaults.buttonSize),
    'extra-small',
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.style.getPropertyValue('--md-field-row-gap')),
    '24px',
  );
  await page.setViewportSize({ width: 390, height: 740 });
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await panel.waitFor();
  await panel.getByRole('tab', { name: 'Shapes', exact: true }).click();
  await panel.evaluate(async (el) => {
    await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
  });
  const geometry = await panel.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const scroll = el.querySelector('.customization-scroll')!;
    return {
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      viewport: innerWidth,
      height: innerHeight,
      scrollWidth: scroll.scrollWidth,
      clientWidth: scroll.clientWidth,
    };
  });
  assert(
    geometry.left >= 0 && geometry.right <= geometry.viewport && geometry.bottom <= geometry.height,
    JSON.stringify(geometry),
  );
  assert.equal(geometry.scrollWidth, geometry.clientWidth);
  await page.screenshot({ path: '.tmp/docs-customization/mobile.png' });
  await panel.getByRole('tab', { name: 'Code', exact: true }).click();
  assert(await panel.locator('.customization-scroll').evaluate((el) => el.scrollWidth === el.clientWidth));
  await page.screenshot({ path: '.tmp/docs-customization/code-mobile.png', animations: 'disabled' });
  await panel.getByRole('button', { name: /Reset all$/ }).click();
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--md-density') === '0');
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--md-field-row-gap').trim()),
    '1rem',
  );
  assert.equal(await panel.locator('.customization-code').count(), 1);
  assert((await panel.locator('.customization-code').textContent())?.includes('themes/default.css'));
  assert(await page.locator('html').evaluate((el) => el.classList.contains('dark')));
  assert.equal(await page.evaluate(() => localStorage.getItem('m3-vue-docs:sticky-preview-enabled')), 'false');
  await panel.getByRole('button', { name: 'Close customization', exact: true }).click();
  await panel.waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
  await openFixture(page, `${base}/zh-Hans/components/button`);
  await page.getByRole('button', { name: '自定义', exact: true }).click();
  const chinesePanel = page.getByRole('dialog', { name: '自定义', exact: true });
  await chinesePanel.getByRole('tab', { name: '排版', exact: true }).click();
  await choosePreset(chinesePanel, '紧凑');
  await chinesePanel.evaluate(async (el) => {
    await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
  });
  await page.screenshot({ path: '.tmp/docs-customization/typography-zh.png' });
  await chinesePanel.getByRole('tab', { name: '形状', exact: true }).click();
  assert(await chinesePanel.getByRole('button', { name: '移除覆盖值: 操作', exact: true }).isVisible());
  await openFixture(page, `${base}/guides/styling`);
  const gallery = page.locator('.customization-gallery');
  await gallery.waitFor();
  let previews = 0;
  for (const category of ['Actions', 'Inputs', 'Content', 'Navigation', 'Feedback', 'Overlays']) {
    await gallery.getByRole('tab', { name: category, exact: true }).click();
    const samples = gallery.locator('.gallery-sample');
    previews += await samples.count();
    assert(await samples.evaluateAll((elements) => elements.every((el) => el.children.length > 0)));
  }
  assert(previews >= 35);
  await gallery.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const exampleDialog = page.getByRole('dialog').filter({ hasText: 'Delete file?' });
  await exampleDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await gallery.getByRole('tab', { name: 'Inputs', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 740 });
  await gallery.getByRole('tablist').scrollIntoViewIfNeeded();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: '.tmp/docs-customization/gallery-mobile.png', animations: 'disabled' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await gallery.getByRole('tab', { name: 'Actions', exact: true }).click();
  await gallery.getByRole('tablist').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.tmp/docs-customization/gallery-desktop.png', animations: 'disabled' });
  assert.deepEqual(errors, []);
  console.log(
    'Docs customization: standard Popover, density, typography, shapes, component defaults, persistence, nested popovers, mobile layout, dismissal and reset passed.',
  );
} finally {
  await browser.close();
}
