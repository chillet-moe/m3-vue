import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.addInitScript('window.__name = fn => fn');
  await openFixture(page, new URL('/tests/browser/surface-density/', server.resolvedUrls!.local[0]).href);
  for (const typography of [14, 12]) {
    for (const density of [0, -2, -99, 3]) {
      await page.evaluate(
        ({ typography, density }) => {
          document.documentElement.style.setProperty('--md-density', String(density));
          document.documentElement.style.setProperty('--md-sys-typescale-body-medium-size', `${typography}px`);
        },
        { typography, density },
      );
      const unit =
        Math.max((12 * typography) / 14, Math.min((20 * typography) / 14, (16 * typography) / 14 + density)) / 16;
      for (const [id, base] of [
        ['circle-flat', 40],
        ['circle-wavy', 48],
        ['line-flat', 4],
        ['line-wavy', 10],
      ] as const) {
        const locator = page.getByTestId(id);
        await page.waitForFunction(
          ({ id, expected }) =>
            Math.abs(document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect().height - expected) < 0.1,
          { id, expected: base * unit },
        );
        if (id.startsWith('circle')) {
          await page.waitForFunction(
            ({ id, expected }) =>
              Math.abs(
                Number(document.querySelector(`[data-testid="${id}"] svg`)!.getAttribute('viewBox')!.split(' ')[2]) -
                  expected,
              ) < 0.1,
            { id, expected: base * unit },
          );
        }
        assert(Math.abs((await locator.evaluate((el) => el.getBoundingClientRect().height)) - base * unit) < 0.1);
      }
      assert.equal(await page.getByTestId('override').evaluate((el) => el.getBoundingClientRect().width), 48);
      for (const kind of ['Dialog', 'BottomSheet', 'SideSheet']) {
        await page.getByRole('button', { name: kind, exact: true }).click();
        const dialog = page.locator('dialog[open]');
        const content = dialog.locator('[data-part="content"]').first();
        assert.equal(
          await content.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft)),
          Math.max(12, 24 + density * 2),
        );
        assert.equal(
          await dialog
            .locator('[data-scope="text-field"][data-part="root"]')
            .evaluate((el) => getComputedStyle(el).getPropertyValue('--md-density').trim()),
          String(density),
        );
        await dialog.getByRole('button', { name: 'Close', exact: true }).click();
        await dialog.waitFor({ state: 'hidden' });
      }
    }
  }
  console.log('Surface and progress density checks passed');
} finally {
  await browser.close();
  await server.close();
}
