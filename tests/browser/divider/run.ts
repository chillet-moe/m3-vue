import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage();
  await openFixture(page, new URL('/tests/browser/divider/', server.resolvedUrls!.local[0]).href);
  for (const custom of [false, true, false]) {
    for (const orientation of ['horizontal', 'vertical']) {
      for (const mode of ['default', 'inherited', 'inline']) {
        const metrics = await page.getByTestId(`${orientation}-${mode}`).evaluate((element, orientation) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            thickness: orientation === 'horizontal' ? rect.height : rect.width,
            spacing: parseFloat(orientation === 'horizontal' ? style.marginBlockStart : style.marginInlineStart),
          };
        }, orientation);
        const expected =
          mode === 'inline'
            ? { thickness: 4, spacing: 6 }
            : custom
              ? { thickness: 5, spacing: 12 }
              : mode === 'inherited'
                ? { thickness: 3, spacing: 8 }
                : { thickness: 1, spacing: 0 };
        assert.deepEqual(metrics, expected, `${orientation}-${mode}, custom: ${custom}`);
      }
    }
    await page.getByRole('button', { name: 'Toggle overrides' }).click();
  }
  console.log('Divider default geometry, prop clearing, inheritance and inline overrides passed.');
} finally {
  await browser.close();
  await server.close();
}
