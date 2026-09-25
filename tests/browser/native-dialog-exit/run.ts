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

  await page.goto(new URL(fixturePath, serverUrl).href, { waitUntil: 'networkidle' });
  await page.waitForSelector('.m3-dialog[open] .m3-dialog-actions');
  await page.waitForTimeout(700);

  const observedAnimations = await page.evaluate(() => window.__nativeDialogExitFixture.close());
  assert(observedAnimations.hasActionsTransition, 'The fixture should exercise the owned actions transition');
  assert(observedAnimations.hasBackdropTransition, 'The fixture should exercise the ::backdrop transition');

  await page.waitForFunction(() => window.__nativeDialogExitFixture.getClosedElapsed() !== null, undefined, {
    timeout: 2500,
  });
  const closedElapsed = await page.evaluate(() => window.__nativeDialogExitFixture.getClosedElapsed());

  assert(closedElapsed !== null);
  assert(closedElapsed >= 550, `closed fired before the 650ms owned exit completed (${closedElapsed}ms)`);
  assert(closedElapsed < 2000, `closed was blocked by the infinite slot animation (${closedElapsed}ms)`);

  console.log('Native dialog exit lifecycle browser regression passed.');
} finally {
  await browser?.close();
  await server?.close();
}
