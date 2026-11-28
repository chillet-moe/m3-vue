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
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Show persistent' }).click();
  await page.getByRole('button', { name: 'Toggle mode' }).click();
  await page.getByRole('button', { name: 'Toggle previews' }).click();

  const previews = stack.getByTestId('status-0');
  const mode = stack.getByTestId('status-1');
  const snackbar = stack.getByRole('status');
  const wide = (await previews.boundingBox())!;
  await page.setViewportSize({ width: 320, height: 640 });
  const wrapped = (await previews.boundingBox())!;
  const modeBox = (await mode.boundingBox())!;
  const snackbarBox = (await snackbar.boundingBox())!;
  assert(wrapped.height > wide.height, 'The preview message wraps in the narrow viewport');
  assert.equal(wrapped.y, 16);
  assert.equal(modeBox.y - (wrapped.y + wrapped.height), 8);
  assert.equal(snackbarBox.y - (modeBox.y + modeBox.height), 8);

  // Hit the content, empty stack space beside the short status, and the gap above the snackbar.
  await page.mouse.click(wrapped.x + 5, wrapped.y + 5);
  await page.mouse.click(wrapped.x + 5, modeBox.y + 5);
  await page.mouse.click(modeBox.x + 5, snackbarBox.y - 4);
  assert.equal(await page.getByRole('button', { name: /Background clicks/ }).textContent(), 'Background clicks: 3');

  for (const rootSize of [16, 20]) {
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = size + 'px';
    }, rootSize);
    for (const surface of [previews, mode, snackbar]) {
      const box = (await surface.boundingBox())!;
      assert.equal(320 - box.x - box.width, 16, `Right inset at ${rootSize}px root font size`);
    }
    assert.equal((await page.getByTestId('standalone').boundingBox())!.width, 320 - 2 * rootSize);
  }

  await page.getByRole('button', { name: 'Toggle previews' }).click();
  await previews.waitFor({ state: 'detached' });
  assert.equal((await mode.boundingBox())!.y, 16);
  await action.click();
  await snackbar.waitFor({ state: 'detached' });
  assert.equal(await result.textContent(), 'action');
  assert(await mode.isVisible());
  await page.getByRole('button', { name: 'Toggle mode' }).click();
  await stack.waitFor({ state: 'detached' });
  const toggleMode = page.getByRole('button', { name: 'Toggle mode' });
  const autofocusLauncher = page.getByRole('button', { name: 'Show with autofocus' });
  for (const statusFirst of [false, true]) {
    if (statusFirst) {
      await toggleMode.click();
      await mode.waitFor({ state: 'visible' });
      assert(await toggleMode.evaluate((button) => button.matches(':focus')), 'Opening a status preserves focus');
    }
    await autofocusLauncher.click();
    await action.waitFor({ state: 'visible' });
    assert(
      await action.evaluate((button) => button.matches(':focus')),
      `Explicit action autofocus (status first: ${statusFirst})`,
    );
    await page.keyboard.press('Enter');
    await action.waitFor({ state: 'detached' });
    assert.equal(await result.textContent(), 'action');
    if (statusFirst) await toggleMode.click();
    await stack.waitFor({ state: 'detached' });
  }

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Vue's development build buffers component events while waiting for a DevTools client.
  await page.waitForFunction(() => !(window as any).__VUE_DEVTOOLS_HOOK_REPLAY__);
  const heap = await page.context().newCDPSession(page);
  for (const method of ['close', 'unmount']) {
    const retired = await page.evaluateHandle((method) => (window as any).retireStatus(method), method);
    await page.getByTestId('retired-status').waitFor({ state: 'detached' });
    await heap.send('HeapProfiler.collectGarbage');
    await heap.send('HeapProfiler.collectGarbage');
    assert.deepEqual(
      await retired.evaluate(({ close, element, payload }) => {
        close();
        return { element: !!element.deref(), payload: !!payload.deref() };
      }),
      { element: false, payload: false },
      `Keeping a close callback after ${method} must release the retired DOM and render payload`,
    );
    await retired.dispose();
  }
  await heap.detach();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const position of ['top', 'bottom', 'top-end']) {
    await openFixture(page, `${url}?position=${position}`);
    await toggleMode.click();
    await page.getByRole('button', { name: 'Show persistent' }).click();
    for (const direction of ['ltr', 'rtl']) {
      await page.evaluate((dir) => {
        document.documentElement.dir = dir;
      }, direction);
      for (const surface of [snackbar, mode]) {
        const box = (await surface.boundingBox())!;
        if (position === 'top-end') {
          const inset = direction === 'ltr' ? 320 - box.x - box.width : box.x;
          assert.equal(inset, 16, `Inline-end inset in ${direction}`);
        } else {
          assert.equal(Math.round(box.x + box.width / 2), 160, `${position} center in ${direction}`);
        }
      }
    }
  }
  console.log('Snackbar lifecycle, resource release, LTR/RTL layout, pointer pass-through and autofocus passed.');
} finally {
  await browser.close();
  await server.close();
}
