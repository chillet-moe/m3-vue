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
  await openFixture(page, new URL('/tests/browser/slider-icons/', server.resolvedUrls!.local[0]).href);
  for (const preset of ['default', 'compact'] as const) {
    await page.locator('main').evaluate(
      (el, tokens) => {
        for (const [key, value] of Object.entries(tokens)) el.style.setProperty(key, value);
      },
      { ...typographyPresets[preset], '--md-density': preset === 'compact' ? '-2' : '0' },
    );
    const cases = await page.locator('[data-test-case]').evaluateAll((elements) =>
      elements.map((root) => {
        const host = root.getBoundingClientRect();
        return {
          name: root.getAttribute('data-test-case')!,
          icons: [...root.querySelectorAll('[data-inset-icon]')].map((slot) => {
            const box = slot.getBoundingClientRect();
            const image = slot.querySelector('[data-scope="icon"]')!.getBoundingClientRect();
            const glyph = slot.querySelector('.m3-icon-glyph')!.getBoundingClientRect();
            return {
              width: image.width,
              height: image.height,
              centerX: image.x + image.width / 2 - box.x - box.width / 2,
              centerY: image.y + image.height / 2 - box.y - box.height / 2,
              glyphX: glyph.x + glyph.width / 2 - image.x - image.width / 2,
              glyphY: glyph.y + glyph.height / 2 - image.y - image.height / 2,
              inside:
                box.left >= host.left - 0.1 &&
                box.right <= host.right + 0.1 &&
                box.top >= host.top - 0.1 &&
                box.bottom <= host.bottom + 0.1,
            };
          }),
        };
      }),
    );
    for (const item of cases) {
      assert.equal(item.icons.length, 2, item.name);
      for (const icon of item.icons) {
        const expected = item.name.startsWith('extra-large') ? 32 : 24;
        assert.equal(icon.width, expected, item.name);
        assert.equal(icon.height, expected, item.name);
        for (const offset of [icon.centerX, icon.centerY, icon.glyphX, icon.glyphY])
          assert(Math.abs(offset) < 0.1, JSON.stringify({ preset, ...item }));
        assert(icon.inside, JSON.stringify({ preset, ...item }));
      }
    }
  }
  console.log(
    'Slider icons: size, centering and bounds across orientations, directions and endpoint placements passed',
  );
} finally {
  await browser.close();
  await server.close();
}
