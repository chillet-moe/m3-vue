import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
let browser;
try {
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  await page.addInitScript('window.__name = (fn) => fn');
  await openFixture(page, new URL('/tests/browser/shapes/', server.resolvedUrls!.local[0]).href);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const targets = [
    ['[data-testid="checkbox"] [data-part="box"]', '2px'],
    ['[data-testid="button"]', '3px'],
    ['[data-testid="icon"]', '3px'],
    ['[data-testid="toggle"]', '3px'],
    ['[data-testid="icon-toggle"]', '3px'],
    ['[data-testid="group"] [data-scope="button"]', '3px'],
    ['[data-testid="field"] [data-part="container"]', '3px'],
    ['[data-testid="otp"] [data-part="input"]', '3px'],
    ['[data-testid="card"]', '4px'],
    ['[data-testid="chip"]', '3px'],
    ['[data-testid="fab"]', '4px'],
    ['[data-testid="fab-menu-item"]', '3px'],
    ['[data-testid="list"]', '2px'],
    ['[data-testid="expressive"]', '2px'],
    ['[data-testid="static-list"]', '2px'],
    ['[data-testid="tree"] [data-part="row"]', '2px'],
    ['[data-testid="drawer"]', '2px'],
    ['[data-testid="section"] [data-part="trigger"]', '2px'],
    ['[data-testid="rail"] [data-part="indicator"]', '2px'],
    ['[data-testid="menu-item"]', '2px'],
    ['[data-testid="menu"] [data-part="container"]', '4px'],
    ['[data-scope="navigation-drawer"][data-part="root"]', '4px'],
    ['[data-scope="navigation-rail"][data-part="root"]', '4px'],
    ['[data-testid="popover"] [data-part="surface"]', '4px'],
    ['[data-testid="dialog"] [data-part="surface"]', '6px'],
    ['[data-testid="snackbar"]', '2px'],
    ['[data-testid="bottom"] [data-part="surface"]', '6px'],
    ['[data-testid="side"] [data-part="surface"]', '6px'],
    ['[data-testid="date"] [data-part="surface"]', '6px'],
    ['[data-testid="date"] [data-part="month-switch"]', '3px'],
    ['[data-testid="date"] [data-part="day"]', '2px'],
    ['[data-testid="range"] [data-part="start-selector"]', '3px'],
    ['[data-testid="time"] [data-part="hour-input"]', '3px'],
    ['[data-testid="range"] [data-part="year-switch"]', '3px'],
    ['[data-testid="range"] [data-part="surface"]', '6px'],
    ['[data-testid="time"] [data-part="surface"]', '6px'],
  ] as const;
  const radii = (selector: string, pseudo?: string) =>
    page.locator(selector).evaluateAll(async (els, pseudo) => {
      await Promise.all(els.flatMap((el) => el.getAnimations().map((a) => a.finished.catch(() => {}))));
      return els.map((el) => {
        const css = getComputedStyle(el, pseudo);
        return [
          css.borderTopLeftRadius,
          css.borderTopRightRadius,
          css.borderBottomRightRadius,
          css.borderBottomLeftRadius,
        ];
      });
    }, pseudo);
  for (const [shape, radius] of [
    ['minimal', '2px'],
    ['sharp', '0px'],
  ] as const) {
    await page.getByRole('combobox', { name: 'Shape', exact: true }).selectOption(shape);
    for (const [target, minimalRadius] of targets) {
      assert(await page.locator(target).count(), `Missing probe: ${target}`);
      for (const corners of await radii(target))
        assert.deepEqual(corners, Array(4).fill(shape === 'minimal' ? minimalRadius : radius), `${shape}: ${target}`);
    }
    for (const id of ['list', 'expressive']) {
      for (const corners of await radii(`[data-testid="${id}"]`, '::before'))
        assert.deepEqual(corners, Array(4).fill(radius), `${shape}: ${id} indicator`);
    }
    assert.deepEqual((await radii('[data-testid="token"]'))[0], Array(4).fill('7px'));
    const groupToken = await radii('[data-testid="group-token"] [data-scope="button"]');
    assert.equal(groupToken[0]![1], '7px');
    assert.notEqual((await radii('[data-testid="local"]'))[0]![0], radius);
    assert.equal((await radii('[data-testid="fab-menu-local"]'))[0]![0], '28px');
    assert.equal((await radii('[data-testid="local-tree"] [data-part="row"]'))[0]![0], '4px');
    for (const id of ['button', 'icon', 'toggle', 'icon-toggle', 'expressive', 'fixed']) {
      const el = page.getByTestId(id);
      await el.scrollIntoViewIfNeeded();
      const box = await el.boundingBox();
      assert(box);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForFunction(
        ({ id, expected }) =>
          document.querySelector(`[data-testid="${id}"]`)?.getAttribute('data-pressed') === expected,
        { id, expected: id === 'fixed' ? 'false' : 'true' },
      );
      for (const corners of await radii(`[data-testid="${id}"]`))
        assert.deepEqual(
          corners,
          Array(4).fill(shape === 'minimal' ? (id === 'fixed' ? '3px' : '2px') : radius),
          `pressed ${shape}: ${id}`,
        );
      await page.mouse.up();
    }
    // Every position and selection state in a connected group respects the mode.
    for (const group of ['group', 'group-fixed']) {
      const members = page.getByTestId(group).locator('[data-scope="button"]');
      for (const el of await members.all()) {
        await el.scrollIntoViewIfNeeded();
        const box = await el.boundingBox();
        assert(box);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await el.evaluate(async (el) => {
          await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {})));
        });
        const corners = await el.evaluate((el) => {
          const s = getComputedStyle(el);
          return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomLeftRadius, s.borderBottomRightRadius];
        });
        assert.deepEqual(
          corners,
          Array(4).fill(shape === 'minimal' ? (group === 'group-fixed' ? '3px' : '2px') : '0px'),
        );
        await page.mouse.up();
      }
    }
  }
  console.log(
    'Shape modes: surfaces, rows, local overrides, tokens, selected states, press morph and connected groups passed.',
  );
} finally {
  await browser?.close();
  await server.close();
}
