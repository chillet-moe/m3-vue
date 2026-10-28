import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage();
  await page.addInitScript('window.__name = fn => fn');
  await openFixture(page, new URL('/tests/browser/icon-sizing/', server.resolvedUrls!.local[0]).href);
  for (const density of [-99, -2, 0, 2, 99]) {
    for (const scale of [0.5, 1, 2]) {
      await page.locator('main').evaluate(
        (el, { density, scale }) => {
          el.style.setProperty('--md-density', String(density));
          el.style.setProperty('--md-icon-scale', String(scale));
        },
        { density, scale },
      );
      const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'];
      const probes = [
        ...sizes.map((size, i) => [`button-${size}`, [20, 20, 24, 32, 40][i]]),
        ...sizes.map((size, i) => [`icon-${size}`, [20, 24, 24, 32, 40][i]]),
        ['slotted-icon', 32],
        ['chip', 18],
        ['menu', 20],
        ['list', 24],
        ['field', 24],
        ['tree', 18],
        ['symbol', 24],
      ] as [string, number][];
      for (const [key, base] of probes) {
        const metric = await page.locator(`[data-test="${key}"]`).evaluate((root) => {
          const icon = root.matches('[data-source]') ? root : root.querySelector('[data-source]')!;
          if (!icon) throw new Error(root.outerHTML);
          const box = icon.getBoundingClientRect();
          const host = root.getBoundingClientRect();
          return { size: box.height, host: host.height, variations: getComputedStyle(icon).fontVariationSettings };
        });
        const expected = Math.max(Math.max(16, base - 4), Math.min(base + 4, base + density)) * scale;
        assert.equal(metric.size, expected, JSON.stringify({ key, density, scale, metric }));
        assert(metric.host >= metric.size, `Content fits ${key}`);
        assert(metric.variations.includes('opsz'), 'Variable font optical sizing remains enabled');
      }
      assert.equal(
        await page.locator('[data-test="explicit"]').evaluate((el) => el.getBoundingClientRect().height),
        32,
      );
      assert.equal(
        await page.locator('[data-test="override"] [data-source]').evaluate((el) => el.getBoundingClientRect().height),
        30,
      );
    }
  }
  const measure = () =>
    page.locator('[data-test="symbol"]').evaluate((root) => ({
      box: root.getBoundingClientRect().width,
      glyph: root.firstElementChild!.getBoundingClientRect().width,
    }));
  const before = await measure();
  await page.locator('main').evaluate((el) => el.style.setProperty('--md-icon-content-ratio', '0.5'));
  const after = await measure();
  assert.equal(before.box, after.box);
  assert(Math.abs(after.glyph / after.box - 5 / 3) < 0.001);
  const svg = await page
    .locator('[data-test="svg"]')
    .evaluate((root) => root.firstElementChild!.getBoundingClientRect().width / root.getBoundingClientRect().width);
  assert(Math.abs(svg - 5 / 6) < 0.001, 'Local source calibration overrides inherited ratio');
  console.log('Icon density, scale, overrides, source calibration and content bounds passed.');
} finally {
  await browser.close();
  await server.close();
}
