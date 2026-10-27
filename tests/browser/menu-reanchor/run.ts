import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

const fixturePath = '/tests/browser/menu-reanchor/';
const systemChromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;

try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();

  browser = await chromium.launch({
    ...(existsSync(systemChromePath) ? { executablePath: systemChromePath } : {}),
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  const serverUrl = server.resolvedUrls?.local[0];
  assert(serverUrl, 'Vite did not expose a local development URL');
  await openFixture(page, new URL(fixturePath, serverUrl).href, { waitUntil: 'networkidle' });

  const call = (method: string, ...args: unknown[]) =>
    page.evaluate(({ method, args }) => (window as any).fixture[method](...args), { method, args });
  async function positioned(id: string, index: number) {
    await page.waitForFunction(
      ({ id, index }) => {
        const panel = document.getElementById(id)!;
        const anchor = document.getElementById(`entry-${index}`)!;
        const box = panel.getBoundingClientRect();
        const target = anchor.getBoundingClientRect();
        return (
          panel.matches(':popover-open') &&
          Math.abs(id === 'popover' ? box.right - target.right : box.left - target.left) < 2 &&
          Math.abs(box.top - target.bottom) < 16
        );
      },
      { id, index },
      { timeout: 3000 },
    );
  }
  await page.locator('#entry-0').click();
  await positioned('menu', 0);
  for (const index of [1, 2, 0, 2]) {
    await page.locator(`#entry-${index}`).hover();
    await positioned('menu', index);
  }
  assert.equal(await page.locator('#changes').textContent(), '[true]');
  assert.equal(await page.locator('#closed').textContent(), '0');
  await call('show', 0, true);
  await page.locator('#second').focus();
  await call('repeat');
  assert.equal(await page.locator('#second').evaluate((el) => el === document.activeElement), true);
  await page.evaluate(() => {
    (window as any).events = [];
    document.addEventListener('focusin', () => (window as any).events.push('focus'));
    document.getElementById('menu')!.addEventListener('beforetoggle', () => (window as any).events.push('toggle'));
  });
  await call('show', 1, false);
  await positioned('menu', 1);
  assert.deepEqual(await page.evaluate(() => (window as any).events), []);
  assert.equal(await page.locator('#second').evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('ArrowRight');
  await positioned('menu', 2);
  assert.equal(await page.locator('#first').evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#second').evaluate((el) => el === document.activeElement), true);
  await call('repeat', true);
  assert.equal(await page.locator('#first').evaluate((el) => el === document.activeElement), true);
  await page.locator('#nested-trigger').hover();
  await page.waitForFunction(() =>
    document.getElementById('nested-item')!.closest('[popover]')!.matches(':popover-open'),
  );
  await call('show', 0);
  await positioned('menu', 0);
  assert.equal(
    await page.locator('#nested-item').evaluate((el) => el.closest('[popover]')!.matches(':popover-open')),
    false,
  );
  assert.equal(await page.locator('#closed').textContent(), '0');
  await call('externalShow', 1);
  await positioned('menu', 1);
  await call('externalShow', 2);
  await positioned('menu', 2);
  await page.locator('#outside').click();
  await page.waitForFunction(() => document.getElementById('closed')!.textContent === '1');
  await call('show', 0, true);
  await call('show', 1, true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#entry-1').evaluate((el) => el === document.activeElement), true);
  await page.waitForFunction(() => document.getElementById('closed')!.textContent === '2');
  await page.evaluate(() => {
    const f = (window as any).fixture;
    f.show(0, true);
    f.hide();
    f.show(2, false);
  });
  await positioned('menu', 2);
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#closed').textContent(), '2');
  await call('hide');
  await page.evaluate(() => {
    const f = (window as any).fixture;
    f.popoverShow(0);
    f.popoverShow(2);
  });
  await positioned('popover', 2);
  await page.evaluate(() => {
    document.getElementById('popover')!.hidePopover();
    (window as any).fixture.popoverShow(1);
  });
  await positioned('popover', 1);
  for (const index of [0, 1, 2, 0]) {
    await call('popoverShow', index);
    await positioned('popover', index);
  }
  await page.locator('#popover-content').focus();
  await call('popoverShow', 2);
  await positioned('popover', 2);
  assert.equal(await page.locator('#popover-content').evaluate((el) => el === document.activeElement), true);
  await call('popoverShow', 0);
  await call('popoverShow');
  await positioned('popover', 0);
  await page.locator('#outside').click();
  assert.equal(await page.locator('#popover').evaluate((el) => el.matches(':popover-open')), false);
  await page.waitForFunction(
    () => document.getElementById('popover')!.style.getPropertyValue('position-anchor') === '',
  );
  await call('repeat');
  assert.equal(
    await page.locator('#menu').evaluate((el) => (el as HTMLElement).style.getPropertyValue('position-anchor')),
    '',
  );
  await page.locator('#menu').evaluate((el) => el.dispatchEvent(new ToggleEvent('toggle', { newState: 'closed' })));
  assert.equal(await page.locator('#menu').evaluate((el) => el.matches(':popover-open')), true);
  await call('hide');
  console.log('Menu and Popover source switching browser regressions passed.');
} finally {
  await browser?.close();
  await server?.close();
}
