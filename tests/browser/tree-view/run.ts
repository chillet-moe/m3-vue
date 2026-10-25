import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
  await page.addInitScript('window.__name = (fn) => fn');
  await page.goto(new URL('/tests/browser/tree-view/', server.resolvedUrls!.local[0]).href);
  const project = page.getByRole('tree', { name: 'Project files' });
  const overview = project.getByRole('treeitem', { name: 'Overview', exact: true, includeHidden: true });
  const documents = project.getByRole('treeitem', { name: 'Documents', exact: true });
  await overview.waitFor();
  const iconFont = process.env.TREE_ICON_FONT_PATH;
  if (iconFont) {
    await page.addStyleTag({
      content: `@font-face { font-family: 'Material Symbols Outlined'; font-weight: 100 700; src: url(data:font/ttf;base64,${readFileSync(iconFont).toString('base64')}); }`,
    });
    await page.evaluate(() => document.fonts.ready);
  }
  await page.locator('#before').focus();
  await page.keyboard.press('Tab');
  assert.equal(await overview.evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('Tab');
  const pin = project.getByRole('button', { name: 'Pin Overview', exact: true });
  assert.equal(await pin.evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(
    await project.getByRole('button', { name: 'Unpin Overview', exact: true }).getAttribute('aria-pressed'),
    'true',
  );
  assert.equal(await overview.getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await overview.evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await documents.evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await overview.isVisible(), false);
  await page.keyboard.press('ArrowDown');
  const source = project.getByRole('treeitem', { name: 'Source', exact: true });
  assert.equal(await source.evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const main = project.getByRole('treeitem', { name: 'main.ts', exact: true });
  assert.equal(await main.evaluate((element) => element === document.activeElement), true);
  assert.equal(await overview.getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Enter');
  assert.equal(await main.getAttribute('aria-selected'), 'true');
  const rootRow = project.locator('[data-part="row"]').first();
  const childRow = main.locator('[data-part="row"]').first();
  const rootBox = await rootRow.boundingBox();
  const childBox = await childRow.boundingBox();
  assert.ok(rootBox && childBox);
  assert.equal(rootBox.x, childBox.x);
  assert.equal(rootBox.width, childBox.width);
  assert.ok(childBox.height >= 32 && childBox.height <= 40);
  const indentation = await main
    .locator('[data-part="label"]')
    .evaluate((element) => element.getBoundingClientRect().left);
  const rootLabel = await project
    .locator('[data-part="label"]')
    .first()
    .evaluate((element) => element.getBoundingClientRect().left);
  assert.ok(indentation > rootLabel);
  await page.keyboard.press('F2');
  assert.equal(
    await project
      .getByRole('button', { name: 'Pin main.ts', exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.keyboard.press('Tab');
  assert.equal(
    await page
      .getByRole('treeitem', { name: 'Appearance', exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await mkdir('.tmp/tree-view', { recursive: true });
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.screenshot({ path: `.tmp/tree-view/${scheme}.png` });
  }
  await project.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await source.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await source.getAttribute('aria-expanded'), 'false');
  await page.reload();
  const notes = project.getByRole('treeitem', { name: 'Notes', exact: true });
  const notesRow = notes.locator('[data-part="row"]').first();
  const clearRipples = async () => {
    await page.evaluate(() => document.querySelectorAll('.ripple').forEach((element) => element.remove()));
  };
  await notes.locator('[data-part="disclosure"]').click();
  assert.equal(await notes.getAttribute('aria-selected'), 'true');
  assert.equal(await notesRow.locator(':scope > .ripple').count(), 1);
  await documents.locator('[data-part="disclosure"]').first().click();
  assert.equal(await documents.getAttribute('aria-expanded'), 'false');
  assert.equal(await notes.getAttribute('aria-selected'), 'true');
  for (const key of ['Enter', 'Space']) {
    await notes.focus();
    await clearRipples();
    await page.keyboard.down(key);
    assert.equal(await notesRow.locator(':scope > .ripple').count(), 1);
    assert.equal(await project.locator('.ripple').count(), 1);
    await page.keyboard.down(key);
    assert.equal(await notesRow.locator(':scope > .ripple').count(), 1);
    await page.keyboard.up(key);
  }
  await clearRipples();
  await notes.press('ArrowUp');
  assert.equal(await project.locator('.ripple').count(), 0);
  const disabled = project.getByRole('treeitem', { name: 'Archived project', exact: true });
  await disabled.focus();
  await disabled.press('Enter');
  await disabled.press('Space');
  assert.equal(await project.locator('.ripple').count(), 0);
  await documents.locator('[data-part="label"]').first().click();
  const notesAction = notes.getByRole('button');
  for (const input of ['pointer', 'Enter', 'Space']) {
    await clearRipples();
    if (input === 'pointer') await notesAction.click();
    else await notesAction.press(input);
    assert.equal(await notesAction.locator(':scope > .ripple').count(), 1);
    assert.equal(await notesRow.locator(':scope > .ripple').count(), 0);
    assert.equal(await documents.getAttribute('aria-selected'), 'true');
    assert.equal(await documents.getAttribute('aria-expanded'), 'false');
  }
  console.log('TreeView browser keyboard, action isolation, layout, and RTL checks passed.');
} finally {
  await browser?.close();
  await server?.close();
}
