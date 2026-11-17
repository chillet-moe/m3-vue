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

  const focusedId = () => page.evaluate(() => document.activeElement?.id);
  const trigger = page.locator('#surface-trigger');
  const action = page.locator('#surface-action');
  for (const kind of ['dialog', 'bottom-sheet', 'side-sheet'] as const) {
    await page.evaluate((name) => window.__nativeDialogExitFixture.mountFocusSurface(name), kind);
    const modal = page.locator(`dialog[data-scope="${kind}"]`);

    await trigger.focus();
    await page.keyboard.press('Tab');
    assert.equal(await focusedId(), 'after-surface', kind);

    await trigger.press('Enter');
    const openedWithSlide = await modal.evaluate(async (element) => {
      const slides = element
        .getAnimations()
        .some((animation) => (animation as CSSTransition).transitionProperty === 'transform');
      await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
      return slides;
    });
    if (kind === 'side-sheet') {
      assert(openedWithSlide, 'The side sheet must slide in from its closed position');
      const bounds = await modal.boundingBox();
      assert(bounds);
      await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + 4);
      assert(
        await modal.evaluate((element: HTMLDialogElement) => element.open),
        'Clicking sheet padding keeps it open',
      );
    }
    if (kind === 'bottom-sheet') {
      const surface = modal.locator('[data-part="surface"]');
      const resting = await surface.boundingBox();
      const handle = await modal.locator('[data-part="drag-handle"]').boundingBox();
      assert(resting && handle);
      const x = handle.x + handle.width / 2;
      const y = handle.y + handle.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, y - 60, { steps: 12 });
      const stretched = await surface.boundingBox();
      assert(stretched);
      assert(Math.abs(stretched.height - resting.height - 13.2) < 0.1, 'An upward drag extends the surface');
      assert.equal(stretched.y + stretched.height, resting.y + resting.height, 'The lower edge stays at the viewport');
      await page.mouse.up();
      await surface.evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished));
      });
      assert.deepEqual(await surface.boundingBox(), resting, 'The surface rebounds to its original geometry');
    }
    await action.focus();
    assert.equal(await focusedId(), 'surface-action', kind);

    const exit = await modal.evaluate((element: HTMLDialogElement) => {
      element.close();
      const animations = element.getAnimations({ subtree: true });
      for (const animation of animations) animation.pause();
      return {
        hasMotion: animations.length > 0,
        hasSlide: element
          .getAnimations()
          .some((animation) => (animation as CSSTransition).transitionProperty === 'transform'),
      };
    });
    assert(exit.hasMotion, `${kind} must animate after native close`);
    if (kind === 'side-sheet') {
      assert(exit.hasSlide, 'The side sheet must slide out after native close');
    }
    await page.locator('#surface-trigger[data-close-count="1"]').waitFor();
    assert.equal(await focusedId(), 'surface-trigger', kind);
    assert.equal(await action.evaluate((element) => getComputedStyle(element).visibility), 'visible', kind);
    await action.focus();
    assert.equal(await focusedId(), 'surface-trigger', kind);
    await page.keyboard.press('Tab');
    assert.equal(await focusedId(), 'after-surface', kind);

    await trigger.press('Enter');
    const reopened = await modal.evaluate(async (element: HTMLDialogElement) => {
      if (!element.open) return false;
      const animations = element.getAnimations({ subtree: true });
      for (const animation of animations) {
        if (animation.playState === 'paused') animation.play();
      }
      await Promise.allSettled(animations.map((animation) => animation.finished));
      return element.open;
    });
    assert(reopened, `${kind} must reopen during its exit`);
    await action.focus();
    assert.equal(await focusedId(), 'surface-action', kind);
    assert.equal(await trigger.getAttribute('data-closed-count'), '0', `${kind} reopening must cancel the visual exit`);

    await page.keyboard.press('Escape');
    await page.locator('#surface-trigger[data-closed-count="1"]').waitFor();
    assert.equal(await focusedId(), 'surface-trigger', kind);
    if (kind === 'side-sheet') {
      assert.equal(await modal.evaluate((element) => getComputedStyle(element).display), 'none');
    }
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.press('Enter');
  assert.equal(await focusedId(), 'surface-action');
  await page.mouse.click(5, 5);
  await page.locator('#surface-trigger[data-closed-count="2"]').waitFor();
  assert.equal(await focusedId(), 'surface-trigger');
  await page.keyboard.press('Tab');
  assert.equal(await focusedId(), 'after-surface');

  console.log('Native dialog exit lifecycle browser regression passed.');
} finally {
  await browser?.close();
  await server?.close();
}
