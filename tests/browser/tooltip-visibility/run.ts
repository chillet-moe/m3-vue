import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer } from 'vite';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
let browser: Browser | undefined;

try {
  await server.listen();
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({
    ...(existsSync(chrome) ? { executablePath: chrome } : {}),
    headless: true,
  });
  const page = await browser.newPage({ reducedMotion: 'no-preference' });
  page.setDefaultTimeout(5000);
  const url = new URL('/tests/browser/tooltip-visibility/', server.resolvedUrls!.local[0]).href;

  for (const cssAnchor of [true, false]) {
    if (!cssAnchor) {
      await page.addInitScript(() => {
        const supports = CSS.supports.bind(CSS);
        CSS.supports = (property, value?) => {
          if (property === 'position-anchor: --a') return false;
          return value === undefined ? supports(property) : supports(property, value);
        };
      });
    }
    await openFixture(page, url);
    const tip = page.locator('#tip');
    assert.equal(await tip.evaluate((element) => element.getClientRects().length), 0);

    const observed = await tip.evaluate(async (element: HTMLElement) => {
      element.showPopover();
      const hasEntryBox = element.getClientRects().length > 0;
      const entry = element.getAnimations().filter((animation) => animation instanceof CSSTransition);
      await Promise.allSettled(entry.map((animation) => animation.finished));
      const enteredOpacity = getComputedStyle(element).opacity;

      const tipRect = element.getBoundingClientRect();
      const triggerRect = document.getElementById('trigger')!.getBoundingClientRect();
      const unopenedHasBox = document.getElementById('closed-tip')!.getClientRects().length > 0;

      element.hidePopover();
      const hasExitBox = element.getClientRects().length > 0;
      const exit = element.getAnimations().filter((animation) => animation instanceof CSSTransition);
      await Promise.allSettled(exit.map((animation) => animation.finished));

      return {
        hasEntryBox,
        hasExitBox,
        enteredOpacity,
        entryProperties: entry.map((animation) => animation.transitionProperty),
        exitProperties: exit.map((animation) => animation.transitionProperty),
        boxCount: element.getClientRects().length,
        unopenedHasBox,
        centered: Math.abs(tipRect.left + tipRect.width / 2 - triggerRect.left - triggerRect.width / 2) < 1,
        aboveTrigger: tipRect.bottom <= triggerRect.top,
      };
    });

    assert(observed.hasEntryBox && observed.entryProperties.includes('opacity'), 'Expected a visible entry fade.');
    assert.equal(observed.enteredOpacity, '1', 'The open tooltip should reach full opacity.');
    assert(observed.hasExitBox && observed.exitProperties.includes('opacity'), 'Expected a visible exit fade.');
    assert.equal(observed.boxCount, 0, 'Tooltip should leave layout after exit.');
    assert.equal(observed.unopenedHasBox, false, 'An unopened tooltip should have no layout box.');
    if (cssAnchor) {
      assert(observed.centered && observed.aboveTrigger, 'Expected the tooltip above the trigger and centered on it.');
    }
  }

  // Exercise the hidden-attribute lifecycle in browsers without the Popover API.
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', { value: undefined });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', { value: undefined });
  });
  await openFixture(page, url);
  const tip = page.locator('#tip');
  assert.equal(await tip.evaluate((element) => element.getClientRects().length), 0);

  await page.locator('#trigger').hover();
  await tip.waitFor({ state: 'visible' });
  await page.mouse.move(0, 0);
  await tip.waitFor({ state: 'hidden' });
  assert.equal(await tip.evaluate((element) => element.getClientRects().length), 0);

  const delegatedPage = await browser.newPage({ reducedMotion: 'no-preference' });
  await delegatedPage.addInitScript('window.__name = (fn) => fn');
  for (const duration of [150, 420, 0]) {
    await openFixture(delegatedPage, `${url}?delegated`);
    await delegatedPage.evaluate((duration) => {
      document.documentElement.style.setProperty('--md-duration-fast', `${duration}ms`);
    }, duration);
    await delegatedPage.locator('#first').focus();
    const outgoing = delegatedPage.locator('#delegated-tip-0');
    await outgoing.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });
    await delegatedPage.locator('#second').focus();
    const exit = await outgoing.evaluateHandle((element) => {
      const animations = element.getAnimations();
      for (const animation of animations) animation.pause();
      return animations;
    });
    if (duration === 0) {
      await delegatedPage.waitForFunction(() => document.getElementById('delegated-tip-0')!.textContent === '');
    } else {
      assert(await exit.evaluate((animations) => animations.length > 0), 'Exercise actual owned exit motion');
      await delegatedPage.waitForTimeout(200);
      assert.equal(await outgoing.textContent(), 'First', 'Keep content throughout a paused exit');
      assert(await delegatedPage.locator('#first').getAttribute('aria-describedby'));
      await exit.evaluate((animations) => animations.forEach((animation) => animation.cancel()));
      await delegatedPage.waitForFunction(() => document.getElementById('delegated-tip-0')!.textContent === '');
      assert.equal(await delegatedPage.locator('#first').getAttribute('aria-describedby'), null);

      await delegatedPage.locator('#first').focus();
      await outgoing.evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished));
      });
      await delegatedPage.locator('#second').focus();
      const interrupted = await outgoing.evaluateHandle((element) => {
        const animations = element.getAnimations();
        for (const animation of animations) animation.pause();
        return animations;
      });
      await delegatedPage.locator('#first').focus();
      await interrupted.evaluate((animations) => animations.forEach((animation) => animation.cancel()));
      await delegatedPage.waitForTimeout(200);
      assert.equal(await outgoing.textContent(), 'First', 'An old exit must not clear a reused slot');
      assert(await outgoing.evaluate((element) => element.matches(':popover-open')));
      await interrupted.dispose();
    }
    await exit.dispose();
    await delegatedPage.getByRole('button', { name: 'Unmount tooltips' }).click();
    assert.equal(await delegatedPage.locator('.m3-tooltip').count(), 0);
  }
  await delegatedPage.close();

  console.log('Tooltip visibility and native popover motion regression passed.');
} finally {
  await browser?.close();
  await server.close();
}
