import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.addInitScript('window.__name = (fn) => fn');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFixture(page, new URL('/tests/browser/density/', server.resolvedUrls!.local[0]).href);
  mkdirSync('.tmp/picker-density', { recursive: true });
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const density of [0, -2, -99, 3]) {
      await page
        .locator('.workspace')
        .evaluate((el, value) => (el as HTMLElement).style.setProperty('--md-density', String(value)), density);
      for (const variant of ['modal', 'docked']) {
        await page.getByTestId('picker-variant').selectOption(variant);
        for (const [kind, scope] of [
          ['date', 'date-picker'],
          ['range', 'date-range-picker'],
          ['time', 'time-picker'],
        ]) {
          await page.getByTestId(`open-${kind}`).click();
          const picker = page.locator(`[data-scope="${scope}"][data-part="root"]`).last();
          await picker.waitFor({ state: 'visible' });
          await picker.evaluate(async (el) => {
            await Promise.all(
              el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})),
            );
          });
          const metrics = await picker.evaluate((root) => {
            const surface = root.querySelector('[data-part="surface"]')!;
            const days = [...root.querySelectorAll<HTMLElement>('[data-part="day"]')].filter((el) =>
              el.checkVisibility(),
            );
            return {
              density: getComputedStyle(root).getPropertyValue('--md-density').trim(),
              width: surface.getBoundingClientRect().width,
              scrollWidth: surface.scrollWidth,
              clientWidth: surface.clientWidth,
              days: days.map((day) => ({ width: day.offsetWidth, height: day.offsetHeight })),
              clock: root.querySelector('[data-part="clock-face"]')?.getBoundingClientRect().width,
              display: (root.querySelector('[data-part="hour-display"]') as HTMLElement | null)?.offsetHeight,
            };
          });
          assert.equal(metrics.density, String(density));
          assert(
            metrics.width <= width && metrics.scrollWidth <= metrics.clientWidth + 1,
            JSON.stringify({ width, density, scope, metrics }),
          );
          if (kind !== 'time') {
            assert(metrics.days.length >= 28);
            const clippedLabels = await picker
              .locator('[data-part="month-switch"] [data-part="text"], [data-part="year-switch"] [data-part="text"]')
              .evaluateAll((labels) => labels.some((label) => label.scrollWidth > label.clientWidth + 1));
            assert.equal(clippedLabels, false, JSON.stringify({ width, density, kind, variant }));
            for (const day of metrics.days) {
              assert.equal(day.width, day.height, 'Calendar cells remain square');
              assert(day.width >= 32 && day.width <= Math.max(32, 48 + density * 4));
              if (width === 1280) assert.equal(day.width, Math.max(32, 48 + density * 4));
            }
            await picker.locator('[data-part="month-switch"]').click();
            const month = picker.locator('[data-part="month"]').first();
            await month.waitFor();
            const rowHeight = await month.evaluate((el) => el.getBoundingClientRect().height);
            assert.equal(rowHeight, Math.max(32, 48 + density * 4));
            await picker.locator('[data-part="month"][data-selected="true"]').click();
          } else {
            assert.equal(metrics.clock, 256, 'Clock geometry must not follow density');
            assert.equal(metrics.display, Math.max(65, 80 + density * 4));
            await picker.locator('[data-part="mode-toggle"]').click();
            const input = picker.locator('[data-part="hour-input"]');
            await input.fill('10');
            assert.equal(
              await input.evaluate((el) => el.getBoundingClientRect().height),
              Math.max(65, 80 + density * 4),
            );
            await picker.locator('[data-part="minute-input"]').fill('45');
            assert.notEqual(await input.getAttribute('aria-invalid'), 'true');
            await picker.locator('[data-part="mode-toggle"]').click();
          }
          if (variant === 'modal' && density === -2)
            await picker.screenshot({ path: `.tmp/picker-density/${kind}-${width}.png` });
          await page.keyboard.press('Escape');
          await picker.waitFor({ state: 'hidden' });
        }
      }
    }
  }
  console.log(
    'Picker density: inherited actions, square dates, lists, time inputs, stable clock and viewport bounds passed.',
  );
} finally {
  await browser.close();
  await server.close();
}
