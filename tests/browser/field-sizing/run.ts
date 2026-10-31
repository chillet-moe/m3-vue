import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { typographyPresets } from '../../../src/theme/presets';
import { openFixture } from '../fonts';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage();
  await page.addInitScript('window.__name = fn => fn');
  await openFixture(page, new URL('/tests/browser/field-sizing/', server.resolvedUrls!.local[0]).href);
  for (const preset of ['default', 'compact'] as const) {
    await page.locator('main').evaluate((el, tokens) => {
      for (const [key, value] of Object.entries(tokens)) el.style.setProperty(key, value);
    }, typographyPresets[preset]);
    for (const density of [0, -2, -4, -99, 2]) {
      await page.locator('main').evaluate((el, value) => el.style.setProperty('--md-density', String(value)), density);
      const metrics = await page.locator('section[data-size="small"]').evaluate((root) => ({
        button: root.querySelector('[data-scope="button"][data-part="root"]')!.getBoundingClientRect().height,
        fields: [...root.querySelectorAll('[data-scope="text-field"][data-part="container"]')].map((el) => {
          const input = el.querySelector('input')!;
          const style = getComputedStyle(input);
          const rect = el.getBoundingClientRect();
          return {
            height: rect.height,
            font: parseFloat(style.fontSize),
            line: parseFloat(style.lineHeight),
            contentFits: input.getBoundingClientRect().height <= rect.height,
          };
        }),
      }));
      const line = preset === 'compact' ? 18 : 20;
      const icon =
        (preset === 'compact' ? (20 * 12) / 14 : 20) +
        Math.max(
          -4 * (preset === 'compact' ? 12 / 14 : 1),
          Math.min(4 * (preset === 'compact' ? 12 / 14 : 1), density),
        );
      const expected = Math.max(line, icon) + Math.max(8, 20 + density * 4);
      for (const field of metrics.fields) {
        assert(Math.abs(field.height - expected) < 0.1, JSON.stringify({ preset, density, field, expected }));
        assert.equal(field.font, preset === 'compact' ? 12 : 14);
        assert(field.contentFits);
        if (density >= -2)
          assert(Math.abs(field.height - metrics.button) < 0.1, 'Small fields and Button align at ordinary densities');
      }
      if (preset === 'compact' && density === -2) assert.equal(metrics.fields[0]!.height, 30);
    }
  }
  console.log('Field sizing: typography roles, shared action heights and content floors passed');
} finally {
  await browser.close();
  await server.close();
}
