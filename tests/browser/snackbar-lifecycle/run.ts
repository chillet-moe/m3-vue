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
  const launcher = page.getByRole('button', { name: 'Show timed' });
  const action = page.getByRole('button', { name: 'Undo', exact: true });
  const result = page.getByTestId('result');
  for (const interaction of ['leave-while-focused', 'blur-while-hovered', 'focus-between-actions']) {
    await launcher.click();
    await action.waitFor({ state: 'visible' });
    await action.hover();
    await action.focus();

    if (interaction === 'blur-while-hovered') {
      await launcher.focus();
    } else {
      await page.mouse.move(0, 0);
      if (interaction === 'focus-between-actions') {
        await page.getByRole('button', { name: 'Dismiss notification' }).focus();
      }
    }
    await page.waitForTimeout(650);
    assert.equal(await result.textContent(), '', `${interaction} must keep the timeout paused`);
    assert(await stack.evaluate((element) => element.matches(':popover-open')));

    await launcher.focus();
    await page.mouse.move(0, 0);
    await page.waitForFunction(() => document.querySelector('output')?.textContent === 'timeout');
    await stack.waitFor({ state: 'detached' });
  }
  console.log('Snackbar native visibility, dismissal and overlapping pause reasons passed.');
} finally {
  await browser.close();
  await server.close();
}
