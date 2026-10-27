import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { openFixture } from '../fonts';

// Start the documentation site before running this check.
const base = process.env.DOCS_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript('window.__name = (fn) => fn');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, base);
  const search = page.getByRole('button', { name: 'Search', exact: true }).filter({ visible: true });
  assert.equal(await search.getAttribute('data-scope'), 'button');
  assert.equal(await page.locator('.home-nav a').first().getAttribute('data-size'), 'small');
  assert.equal(await page.locator('.home-guide-grid a').count(), 4);
  assert.equal(await page.locator('.home-component-grid a').count(), 6);
  const searchInput = page.getByRole('searchbox');
  await search.click();
  await searchInput.waitFor();
  await searchInput.fill('Button');
  await page.locator('.VPLocalSearchBox .result').first().waitFor();
  await page.keyboard.press('Escape');
  await searchInput.waitFor({ state: 'hidden' });
  await page.keyboard.press('Control+k');
  await searchInput.waitFor();
  await page.keyboard.press('Escape');
  const defaultHeight = await search.evaluate((el) => el.getBoundingClientRect().height);
  for (const shape of ['minimal', 'sharp']) {
    await page.evaluate(
      (shape) =>
        localStorage.setItem(
          'm3-vue-docs-theme',
          JSON.stringify({
            theme: { preset: 'default', density: -2 },
            defaults: { shape },
          }),
        ),
      shape,
    );
    await page.reload();
    await page.locator(`.home-install[data-shape="${shape}"]`).waitFor();
    await page.waitForFunction(
      (radius) => {
        const card = document.querySelector('.home-install');
        return card && getComputedStyle(card).borderTopLeftRadius === radius;
      },
      shape === 'minimal' ? '4px' : '0px',
    );
    assert.equal(
      await search.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
      shape === 'minimal' ? '3px' : '0px',
    );
    assert((await search.evaluate((el) => el.getBoundingClientRect().height)) < defaultHeight);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await search.getAttribute('data-scope'), 'icon-button');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await search.click();
  await searchInput.waitFor();
  await page.keyboard.press('Escape');
  await openFixture(page, `${base}/getting-started`);
  await search.click();
  await searchInput.waitFor();
  await page.keyboard.press('Escape');
  assert.deepEqual(errors, []);
  console.log('Home components, theme inheritance, responsive search and shortcuts passed.');
} finally {
  await browser.close();
}
