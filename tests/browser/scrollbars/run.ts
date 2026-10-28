import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium, type Locator } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable',
  ignoreDefaultArgs: ['--hide-scrollbars'],
  args: ['--disable-features=OverlayScrollbar,FluentOverlayScrollbar'],
});
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 360 } });
  page.setDefaultTimeout(10000);
  await page.addInitScript('window.__name = (fn) => fn');
  mkdirSync('.tmp/scrollbars', { recursive: true });
  const verify = async (region: Locator, surface: Locator, name: string) => {
    await surface.evaluate(async (el) => {
      await Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {})));
    });
    const metrics = await region.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        width: style.scrollbarWidth,
        colors: style.scrollbarColor,
        gutter: (el as HTMLElement).offsetWidth - el.clientWidth,
        overflows: el.scrollHeight > el.clientHeight,
        horizontalOverflow: el.scrollWidth > el.clientWidth,
      };
    });
    assert.equal(metrics.width, 'thin', name);
    assert(metrics.gutter > 0 && metrics.overflows, `${name}: visible native scrollbar`);
    assert.equal(metrics.horizontalOverflow, false, name);
    const background = await surface.evaluate((el) => getComputedStyle(el).backgroundColor);
    assert(metrics.colors.endsWith(background), `${name}: track matches painted surface`);
    await region.hover();
    await page.mouse.wheel(0, 150);
    await page.waitForFunction((el) => el !== null && el.scrollTop > 0, await region.elementHandle());
    await surface.screenshot({ path: `.tmp/scrollbars/${name}.png` });
  };
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await openFixture(page, new URL('/tests/browser/density/', server.resolvedUrls!.local[0]).href);
    await page.evaluate((value) => (document.documentElement.style.colorScheme = value), scheme);
    for (const [kind, scope, part] of [
      ['date', 'date-picker', 'years'],
      ['range', 'date-range-picker', 'calendars'],
      ['time', 'time-picker', 'surface'],
    ]) {
      await page.getByTestId(`open-${kind}`).click();
      const root = page.locator(`[data-scope="${scope}"][data-part="root"]`).last();
      await root.waitFor({ state: 'visible' });
      if (kind === 'date') await root.locator('[data-part="year-switch"]').click();
      const region = root.locator(`[data-part="${part}"]`).first();
      await verify(region, root.locator('[data-part="surface"]').first(), `${scheme}-${kind}`);
      await page.keyboard.press('Escape');
      await root.waitFor({ state: 'hidden' });
    }
    await openFixture(page, new URL('/tests/browser/dialog-spacing/', server.resolvedUrls!.local[0]).href);
    await page.evaluate((value) => (document.documentElement.style.colorScheme = value), scheme);
    for (const kind of ['dialog', 'side-sheet', 'bottom-sheet'] as const) {
      await page.evaluate(
        (kind) => window.__dialogSpacing({ kind, headline: true, icon: false, actions: true, long: true }),
        kind,
      );
      const root = page.locator('dialog[open]');
      await verify(root.locator('[data-part="content"]'), root.locator('[data-part="surface"]'), `${scheme}-${kind}`);
    }
  }
  console.log('Native scrollbars: pickers, dialog and sheets match their surfaces in light and dark themes.');
} finally {
  await browser.close();
  await server.close();
}
