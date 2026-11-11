import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.addInitScript('window.__name = (fn) => fn');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFixture(page, new URL('/tests/browser/density/', server.resolvedUrls!.local[0]).href);

  async function checkBothOrders(first: string, second: string, check: () => Promise<void>) {
    for (const order of [
      [first, second],
      [second, first],
    ] as const) {
      await page.evaluate(([before, after]) => {
        const styles = [...document.querySelectorAll<HTMLStyleElement>('style[data-vite-dev-id]')];
        const findSheet = (name: string) => styles.find((sheet) => sheet.dataset.viteDevId!.includes(`/${name}.css`));
        const firstSheet = findSheet(before);
        const secondSheet = findSheet(after);
        if (!firstSheet || !secondSheet) throw new Error(`Could not find stylesheets for ${before} and ${after}`);
        firstSheet.after(secondSheet);
      }, order);
      await check();
    }
  }

  const range = page.locator('[data-scope="date-range-picker"][data-part="root"]');
  await range.evaluate((el) => {
    el.style.setProperty('--md-date-picker-docked-container-width', '320px');
    el.style.setProperty('--md-date-range-picker-docked-container-width', '704px');
  });
  for (const [viewportWidth, expectedWidth] of [
    [1280, 704],
    [360, 320],
  ] as const) {
    await page.setViewportSize({ width: viewportWidth, height: 1000 });
    await page.getByTestId('open-range').click();
    await range.waitFor();
    await checkBothOrders('DatePicker', 'DateRangePicker', async () => {
      assert.equal(await range.evaluate((el) => el.getBoundingClientRect().width), expectedWidth);
    });
    await page.keyboard.press('Escape');
    await range.waitFor({ state: 'hidden' });
  }

  for (const [variant, expectedWidth] of [
    ['modal', 328],
    ['docked', 344],
  ] as const) {
    await page.getByTestId('picker-variant').selectOption(variant);
    await page.getByTestId('open-date').click();
    const picker = page.locator(`[data-scope="date-picker"][data-part="root"][data-variant="${variant}"]`);
    await picker.waitFor();
    assert.equal(await picker.evaluate((el) => el.getBoundingClientRect().width), expectedWidth);
    await page.keyboard.press('Escape');
    await picker.waitFor({ state: 'hidden' });
  }

  await page.getByTestId('picker-variant').selectOption('modal');
  await page.setViewportSize({ width: 1280, height: 1000 });
  for (const [kind, scope] of [
    ['date', 'date-picker'],
    ['range', 'date-range-picker'],
  ] as const) {
    const picker = page.locator(`[data-scope="${scope}"][data-part="root"][data-variant="modal"]`);
    await picker.evaluate((el) => {
      el.style.setProperty('--md-date-picker-docked-menu-button-label-text-size', '20px');
      el.style.setProperty('--md-date-picker-docked-menu-button-label-text-line-height', '24px');
    });
    await page.getByTestId(`open-${kind}`).click();
    await picker.waitFor();
    await checkBothOrders('Button', 'DatePicker', async () => {
      for (const part of ['month-switch', 'year-switch']) {
        const label = picker.locator(`[data-part="${part}"] > [data-part="text"]`);
        const typography = await label.evaluate((el) => {
          const { fontSize, lineHeight } = getComputedStyle(el);
          return { fontSize, lineHeight };
        });
        assert.deepEqual(typography, { fontSize: '20px', lineHeight: '24px' }, `${scope} ${part}`);
      }
    });
    await page.keyboard.press('Escape');
    await picker.waitFor({ state: 'hidden' });
  }

  for (const name of ['分类 Category', '搜索 Search']) {
    await page.getByRole('combobox', { name, exact: true }).click();
    const field = page.locator('.m3-select[data-open="true"] [data-scope="text-field"][data-part="root"]');
    await field.waitFor();
    await checkBothOrders('Select', 'TextField', async () => {
      const offset = await field.evaluate(async (el) => {
        await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
        const label = el.querySelector('[data-part="label"]')!.getBoundingClientRect();
        const outline = el.querySelector('[data-part="outline"]')!;
        const outlineCenter =
          outline.getBoundingClientRect().top + parseFloat(getComputedStyle(outline).borderTopWidth) / 2;
        return label.top + label.height / 2 - outlineCenter;
      });
      assert(Math.abs(offset) < 0.5, `${name}: label center is ${offset}px from the outline center`);
    });
    await page.keyboard.press('Escape');
    await field.waitFor({ state: 'hidden' });
  }
  console.log('Picker width, calendar switch typography and floating labels are independent of stylesheet order.');
} finally {
  await browser.close();
  await server.close();
}
