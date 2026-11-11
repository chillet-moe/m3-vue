import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

const fixturePath = '/tests/browser/native-dialog-exit/';
const systemChromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;

try {
  server = await createServer({
    server: {
      host: '127.0.0.1',
      port: 0,
    },
  });
  await server.listen();

  browser = await chromium.launch({
    ...(existsSync(systemChromePath) ? { executablePath: systemChromePath } : {}),
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const serverUrl = server.resolvedUrls?.local[0];
  assert(serverUrl, 'Vite did not expose a local development URL');

  await openFixture(page, new URL(fixturePath, serverUrl).href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(document.querySelector('.m3-dialog[open] .m3-dialog-actions')));
  await page.waitForTimeout(700);

  const observedAnimations = await page.evaluate(() => window.__nativeDialogExitFixture.close());
  assert(observedAnimations.hasNestedBackdrop, 'The fixture should exercise a descendant backdrop animation');
  assert(observedAnimations.hasActionsTransition, 'The fixture should exercise the owned actions transition');
  assert(observedAnimations.hasBackdropTransition, 'The fixture should exercise the ::backdrop transition');

  await page.waitForFunction(() => window.__nativeDialogExitFixture.getClosedElapsed() !== null, undefined, {
    timeout: 2500,
  });
  const closedElapsed = await page.evaluate(() => window.__nativeDialogExitFixture.getClosedElapsed());

  assert(closedElapsed !== null);
  assert(closedElapsed >= 550, `closed fired before the 650ms owned exit completed (${closedElapsed}ms)`);
  assert(closedElapsed < 2000, `closed was blocked by the infinite slot animation (${closedElapsed}ms)`);

  assert.equal(
    await page.evaluate(() => window.__nativeDialogExitFixture.finishNestedDialog()),
    'running',
    'The parent must finish exiting while its descendant backdrop is still animating',
  );

  const pausedExit = await page.evaluateHandle(() => window.__nativeDialogExitFixture.unmountWithPausedExit());
  const heap = await page.context().newCDPSession(page);
  await heap.send('HeapProfiler.collectGarbage');
  await heap.send('HeapProfiler.collectGarbage');
  assert.equal(
    await pausedExit.evaluate(({ target, motion }) => motion.playState === 'paused' && target.deref() === undefined),
    true,
    'Unmounting must release the dialog while the retargeted animation is still paused',
  );
  await pausedExit.evaluate(({ motion }) => motion.cancel());
  await pausedExit.dispose();
  await heap.detach();

  console.log('Native dialog exit lifecycle browser regression passed.');
} finally {
  await browser?.close();
  await server?.close();
}
