import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
const output = '.tmp/select-virtual';
mkdirSync(output, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
  await page.addInitScript('window.__name = (fn) => fn');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, new URL('/tests/browser/select-virtual/', server.resolvedUrls!.local[0]).href);
  const coffee = page.getByRole('combobox', { name: 'Coffee', exact: true });
  await coffee.click();
  // Sample actual rendering across frames, including the opening transform and scroll geometry.
  const frames = await page.evaluate(async () => {
    const menu = document.querySelector<HTMLElement>('.m3-select-menu:popover-open')!;
    const surface = menu.querySelector<HTMLElement>('[data-part="surface"]')!;
    const container = menu.querySelector<HTMLElement>('[data-part="container"]')!;
    const frames = [];
    for (let i = 0; i < 24; i++) {
      const style = getComputedStyle(surface);
      frames.push({
        transform: style.transform,
        origin: style.transformOrigin,
        overflowX: container.scrollWidth - container.clientWidth,
        overflowY: container.scrollHeight - container.clientHeight,
      });
      await new Promise(requestAnimationFrame);
    }
    return frames;
  });
  writeFileSync(`${output}/opening-frames.json`, JSON.stringify(frames, null, 2));
  assert(
    frames.some((frame) => frame.transform !== 'matrix(1, 0, 0, 1, 0, 0)'),
    'opening motion is exercised',
  );
  assert(
    frames.every((frame) => frame.overflowX <= 1),
    'no horizontal scrollbar during opening',
  );
  const listbox = page.getByRole('listbox', { name: 'Coffee', exact: true });
  const rows = listbox.getByRole('option');
  const shape = await rows.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        top: style.borderTopLeftRadius,
        bottom: style.borderBottomLeftRadius,
      };
    }),
  );
  assert.notEqual(shape[0]!.top, shape[1]!.top, 'first upper corners');
  assert.notEqual(shape.at(-1)!.bottom, shape[1]!.bottom, 'last lower corners');
  assert(shape.every((row) => row.height >= 48));
  assert.equal(
    await rows.first().evaluate((el) => getComputedStyle(el).outlineStyle),
    'none',
    'pointer opening has no keyboard outline',
  );
  await coffee.press('ArrowDown');
  assert.equal(await coffee.evaluate((el) => el === el.ownerDocument.activeElement), true);
  assert.equal(await rows.nth(0).getAttribute('aria-selected'), 'true');
  await coffee.press('Enter');
  assert.equal(await rows.nth(1).getAttribute('aria-selected'), 'true');
  const animation = await rows.nth(1).evaluate((el) => ({
    selected: getComputedStyle(el, '::before').animationName,
    leading: getComputedStyle(el.querySelector('[data-part="leading"]')!).animationName,
    ripple: Boolean(el.querySelector('.ripple')),
  }));
  assert.equal(animation.selected, 'm3-menu-item-select');
  assert.equal(animation.leading, 'm3-menu-item-leading-select');
  assert(animation.ripple);
  await coffee.press('Escape');
  await page.waitForFunction(() => document.querySelector('#closed')?.textContent === '1');

  const layer = page.getByRole('combobox', { name: 'Layer', exact: true });
  await layer.click();
  await layer.press('End');
  const virtual = page.getByRole('listbox', { name: 'Layer', exact: true });
  await virtual.getByRole('option', { name: 'Layer 9999', exact: true }).waitFor();
  assert((await virtual.getByRole('option').count()) < 40, 'windowed rendering');
  const descendant = await layer.getAttribute('aria-activedescendant');
  assert(descendant);
  assert.equal(await page.locator(`[id="${descendant}"]`).getAttribute('aria-posinset'), '10000');
  await layer.press('Enter');
  assert.equal(await layer.inputValue(), 'Layer 9999');
  await layer.click();
  await layer.press('Home');
  await virtual.getByRole('option', { name: 'Layer 1', exact: true }).waitFor();
  await layer.press('End');
  const remounted = virtual.getByRole('option', { name: 'Layer 9999', exact: true });
  await remounted.waitFor();
  assert.equal(await remounted.evaluate((el) => getComputedStyle(el, '::before').animationName), 'none');
  await layer.press('Escape');

  const find = page.getByRole('combobox', { name: 'Find layers', exact: true });
  await find.fill('Layer 999');
  const filtered = page.getByRole('listbox', { name: 'Find layers', exact: true });
  await filtered.getByRole('option').first().waitFor();
  await find.press('End');
  await find.press('Enter');
  assert.equal(
    await filtered
      .getByRole('option', { name: 'Layer 9999', exact: true })
      .evaluate((el) => getComputedStyle(el, '::before').animationName),
    'm3-menu-item-select',
  );
  assert.equal(await find.evaluate((el) => el === el.ownerDocument.activeElement), true);
  await find.press('Escape');

  const search = page.getByRole('combobox', { name: 'Find coffee', exact: true });
  await search.fill('Cold');
  await page
    .getByRole('listbox', { name: 'Find coffee' })
    .getByRole('option', { name: /Cold brew/ })
    .waitFor();
  await search.fill('');
  await search.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await coffee.click();
  const reduced = await rows.first().evaluate((el) => getComputedStyle(el, '::before').animationDuration);
  assert.equal(reduced, '0s');
  assert.equal(
    await listbox.locator('[data-part=surface]').evaluate((el) => getComputedStyle(el).transitionDuration),
    '0s',
  );
  await rows.first().click();
  assert.equal(await rows.first().evaluate((el) => getComputedStyle(el, '::before').transitionDuration), '0s');
  await page.screenshot({ path: `${output}/select.png` });
  await coffee.press('Escape');
  await page.locator('#show-checks').uncheck();
  await coffee.click();
  assert.equal(await listbox.locator('[data-part="option-check"]').count(), 0);
  const leading = rows.nth(1).locator('[data-part="option-icon"]');
  assert.equal(await leading.evaluate((el) => getComputedStyle(el).opacity), '1');
  assert.equal(
    await rows
      .nth(1)
      .locator('[data-part="content"]')
      .evaluate((el) => getComputedStyle(el).transform),
    'none',
  );
  await coffee.press('Escape');
  await find.fill('Layer 1');
  await find.press('Home');
  const plain = page
    .getByRole('listbox', { name: 'Find layers', exact: true })
    .getByRole('option', { name: 'Layer 1', exact: true });
  await plain.waitFor();
  assert.equal(await plain.locator('[data-part="leading"]').count(), 0);
  assert.equal(await plain.locator('[data-part="content"]').evaluate((el) => getComputedStyle(el).transform), 'none');
  await find.press('Enter');
  assert.equal(await plain.locator('[data-part="content"]').evaluate((el) => getComputedStyle(el).transform), 'none');
  await find.press('Escape');
  await page.locator('#show-checks').check();
  await coffee.click();
  assert((await listbox.locator('[data-part="option-check"]').count()) > 0);
  assert.deepEqual(errors, []);
  console.log('Select shared presentation, motion, virtual collection, focus and ARIA checks passed.');
} finally {
  await browser.close();
  await server.close();
}
