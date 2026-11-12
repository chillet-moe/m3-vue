import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer } from 'vite';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
const executablePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
let browser: Browser | undefined;

try {
  await server.listen();
  browser = await chromium.launch(existsSync(executablePath) ? { executablePath } : {});
  const page = await browser.newPage({ reducedMotion: 'no-preference' });
  await openFixture(page, new URL('/tests/browser/state-layer-ripple/', server.resolvedUrls!.local[0]).href);

  for (const mode of ['aria', 'native', 'hidden'] as const) {
    const result = await page.locator(`#${mode} .m3-state-layer`).evaluate(async (element, mode) => {
      const layer = element as HTMLElement;
      const panel = layer.parentElement!;
      const control = {
        setInactive(inactive: boolean) {
          if (mode === 'native') (layer as HTMLButtonElement).disabled = inactive;
          else if (mode === 'aria') panel.setAttribute('aria-disabled', String(inactive));
          else panel.hidden = inactive;
        },
        press() {
          layer.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        },
        countRipples() {
          return layer.querySelectorAll('.ripple').length;
        },
      };

      layer.addEventListener('click', () => control.setInactive(true), { once: true });
      control.press();
      const initial = control.countRipples();
      // The candidate key can become disabled in the same task as the press, before the first frame.
      if (mode === 'hidden') await new Promise(requestAnimationFrame);
      layer.click();
      // Let the browser render the disabled or hidden state before restoring the control.
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      control.setInactive(false);
      const afterRestore = control.countRipples();
      control.press();
      return { initial, afterRestore, afterPress: control.countRipples() };
    }, mode);

    assert.deepEqual(result, { initial: 1, afterRestore: 0, afterPress: 1 }, mode);
  }

  await page.locator('#native .m3-state-layer .ripple').waitFor({ state: 'detached' });
  const native = page.locator('#native button');
  const completed = await native.evaluate(async (button) => {
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const ripple = button.querySelector('.ripple')!;
    const animations = ripple.getAnimations();
    await Promise.all(animations.map((animation) => animation.finished));
    await new Promise(requestAnimationFrame);
    return { animations: animations.length, removed: !ripple.isConnected };
  });
  assert.deepEqual(completed, { animations: 2, removed: true });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedMotionRipple = await native.evaluate((button) => {
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    return button.querySelector('.ripple') !== null;
  });
  assert.equal(reducedMotionRipple, false);

  console.log('State layer ripple lifecycle browser regressions passed.');
} finally {
  await browser?.close();
  await server.close();
}
