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
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openFixture(page, `${base}/components/button`);
  const demo = page.locator('.demo-surface').first();
  await demo.waitFor();
  assert.equal(await demo.getAttribute('data-scope'), 'card');
  assert.equal(await demo.evaluate((el) => getComputedStyle(el).borderTopLeftRadius), '0px');
  assert.equal(
    await page
      .locator('.api-table-panel')
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    '0px',
  );
  const source = page.locator('.demo-toolbar').first().getByRole('button');
  await source.click();
  assert.equal(await source.getAttribute('aria-expanded'), 'true');
  await page.locator('.demo-source pre').first().waitFor();
  const sourceSurface = page
    .locator('.demo-surface')
    .filter({ has: page.locator('.demo-source') })
    .first();
  const sourceGeometry = await sourceSurface.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const parts = ['.demo-preview', '.demo-toolbar', '.demo-source'].map((selector) => {
      const child = el.querySelector(selector)!.getBoundingClientRect();
      return { left: child.left - rect.left, right: rect.right - child.right };
    });
    return { parts, shadow: getComputedStyle(el).boxShadow };
  });
  for (const part of sourceGeometry.parts) {
    assert(Math.abs(part.left - 1) < 0.1 && Math.abs(part.right - 1) < 0.1, JSON.stringify(sourceGeometry));
  }
  assert(sourceGeometry.shadow.includes('inset'), 'The outlined surface must retain its border.');
  await source.click();

  await page.getByRole('button', { name: 'Change language', exact: true }).click();
  const english = page.getByRole('menuitem', { name: 'English', exact: true });
  assert.equal(await english.getAttribute('aria-current'), 'true');
  const chinese = page.getByRole('menuitem', { name: '简体中文', exact: true });
  assert((await chinese.getAttribute('href'))?.includes('/zh-Hans/components/button'));
  await chinese.click();
  await page.waitForURL(/\/zh-Hans\/components\/button(?:\.html)?$/);
  await page.getByRole('button', { name: '切换语言', exact: true }).click();
  assert.equal(
    await page.getByRole('menuitem', { name: '简体中文', exact: true }).getAttribute('aria-current'),
    'true',
  );
  await page.keyboard.press('Escape');

  await page.evaluate(() =>
    localStorage.setItem(
      'm3-vue-docs-theme',
      JSON.stringify({
        theme: { preset: 'default' },
        defaults: { shape: 'minimal' },
      }),
    ),
  );
  await page.reload();
  await page.locator('.demo-surface[data-shape="minimal"]').first().waitFor();
  await page.locator('.search-label').click();
  await page.getByRole('searchbox').waitFor();
  assert.equal(
    await page.locator('.VPLocalSearchBox .shell').evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    '6px',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.locator('.VPLocalSearchBox .shell').evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    '0px',
  );
  await page.keyboard.press('Escape');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const path of ['/getting-started', '/zh-Hans/getting-started']) {
    await openFixture(page, `${base}${path}`);
    const codeBlock = page.locator('.vp-doc div[class*="language-"]').first();
    const copy = codeBlock.locator('button.copy');
    for (const dark of [false, true]) {
      await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), dark);
      await copy.focus();
      const before = await copy.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          image: style.backgroundImage,
          size: style.backgroundSize,
          radius: style.borderRadius,
          width: el.getBoundingClientRect().width,
        };
      });
      assert.notEqual(before.image, 'none');
      assert.equal(Number.parseFloat(before.size), 20);
      await copy.click();
      await codeBlock.locator('button.copy.copied').waitFor();
      const after = await copy.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          image: style.backgroundImage,
          size: style.backgroundSize,
          radius: style.borderRadius,
          width: el.getBoundingClientRect().width,
        };
      });
      assert.notEqual(after.image, before.image);
      assert.equal(after.size, before.size);
      assert.equal(after.radius, before.radius);
      assert.equal(after.width, before.width);
      assert((await page.evaluate(() => navigator.clipboard.readText())).trim().length > 0);
      await codeBlock.locator('button.copy.copied').waitFor({ state: 'hidden' });
    }
  }
  assert.deepEqual(errors, []);
  console.log('Home components, theme inheritance, responsive search and shortcuts passed.');
} finally {
  await browser.close();
}
