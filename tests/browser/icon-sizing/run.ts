import assert from 'node:assert/strict';
import { typographyPresets } from '../../../src/theme/presets';
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
        ['tabs', 24],
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
        if (key.startsWith('icon-')) {
          const baseHeight = [32, 40, 56, 96, 136][sizes.indexOf(key.slice(5))]!;
          assert.equal(metric.host, Math.max(expected + 8, baseHeight + density * 2));
        }
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
  for (const density of [0, -2]) {
    await page.locator('main').evaluate(
      (el, { tokens, density }) => {
        for (const [key, value] of Object.entries(tokens)) el.style.setProperty(key, value);
        el.style.setProperty('--md-density', String(density));
        el.style.setProperty('--md-icon-scale', '1');
      },
      { tokens: typographyPresets.compact, density },
    );
    for (const [key, expected] of [
      ['button-small', (20 * 12) / 14 + density],
      ['chip', Math.max((16 * 12) / 14, (18 * 12) / 14 + density)],
      ['menu', (20 * 12) / 14 + density],
      ['field', (24 * 12) / 16 + density],
      ['list', (24 * 12) / 16 + density],
      ['tree', Math.max((16 * 12) / 14, (18 * 12) / 14 + density)],
      ['icon-small', 24 + density],
      ['tabs', (24 * 14) / 16 + density],
      ['override', 30],
    ] as const) {
      const actual = await page
        .locator(`[data-test="${key}"] [data-source]`)
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);
      assert(Math.abs(actual - expected) < 0.05, `Compact ${key}: ${actual} != ${expected}`);
    }
  }
  const clearIcon = await page.locator('[data-test="select-clear"] [data-part="clear-icon"]').evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height, font: parseFloat(getComputedStyle(el).fontSize) };
  });
  assert(Math.abs(clearIcon.height - 13) < 0.05);
  assert.equal(clearIcon.width, clearIcon.height);
  assert.equal(clearIcon.font, clearIcon.height);
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
