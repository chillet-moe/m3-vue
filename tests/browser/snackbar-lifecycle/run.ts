import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage();
  const url = new URL('/tests/browser/snackbar-lifecycle/', server.resolvedUrls!.local[0]).href;
  await openFixture(page, `${url}?cancel`);
  await page.getByRole('button', { name: 'Show persistent' }).click();
  const stack = page.locator('.m3-snackbar-stack-popover');
  assert.deepEqual(
    await stack.evaluate((element) => ({
      open: element.matches(':popover-open'),
      boxes: element.getClientRects().length,
    })),
    { open: false, boxes: 0 },
    'Canceling native opening must keep the snackbar out of layout',
  );

  await openFixture(page, url);
  await page.getByRole('button', { name: 'Show persistent' }).click();
  await stack.waitFor({ state: 'visible' });
  assert(await stack.evaluate((element) => element.matches(':popover-open')));
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await stack.waitFor({ state: 'detached' });
  assert.equal(await page.getByTestId('result').textContent(), 'dismiss');
  console.log('Snackbar native visibility and dismissal passed.');
} finally {
  await browser.close();
  await server.close();
}
