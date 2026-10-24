import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

const fixturePath = '/tests/browser/menu-press-drag/';
const systemChromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;

async function pressDragTo(page: Page, triggerSelector: string, itemSelector: string) {
  const trigger = await page.locator(triggerSelector).boundingBox();
  assert(trigger, `Missing trigger: ${triggerSelector}`);
  await page.mouse.move(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
  await page.mouse.down();
  await page.mouse.move(trigger.x + trigger.width / 2 + 6, trigger.y + trigger.height / 2 + 6);

  const item = await page.locator(itemSelector).boundingBox();
  assert(item, `Missing item: ${itemSelector}`);
  await page.mouse.move(item.x + item.width / 2, item.y + item.height / 2, { steps: 5 });
  await page.mouse.up();
}

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
  await page.goto(new URL(fixturePath, serverUrl).href, { waitUntil: 'networkidle' });

  await page.locator('#menu-trigger').click();
  assert.equal(await page.locator('#press-menu').evaluate((menu) => menu.matches(':popover-open')), true);
  await page.locator('#menu-trigger').click();
  assert.equal(await page.locator('#press-menu').evaluate((menu) => menu.matches(':popover-open')), false);

  const menuTrigger = await page.locator('#menu-trigger').boundingBox();
  assert(menuTrigger);
  await page.mouse.move(menuTrigger.x + menuTrigger.width / 2, menuTrigger.y + menuTrigger.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(180);
  assert.equal(await page.locator('#press-menu').evaluate((menu) => menu.matches(':popover-open')), true);
  await page.mouse.up();
  assert.equal(await page.locator('#press-menu').evaluate((menu) => menu.matches(':popover-open')), true);
  await page.locator('#menu-trigger').click();

  await pressDragTo(page, '#menu-trigger', '#press-menu [role="menuitem"]:nth-child(2)');
  assert.equal(await page.locator('#menu-selection').textContent(), 'Second');
  assert.equal(await page.locator('#press-menu').evaluate((menu) => menu.matches(':popover-open')), false);

  await pressDragTo(page, '.m3-select-trigger', '.m3-select-item:nth-child(2)');
  assert.equal(await page.locator('#select-value').textContent(), 'pour-over');
  assert.equal(await page.locator('.m3-select-menu').evaluate((menu) => menu.matches(':popover-open')), false);

  const selectTrigger = await page.locator('.m3-select-trigger').boundingBox();
  assert(selectTrigger);
  await page.mouse.move(selectTrigger.x + selectTrigger.width / 2, selectTrigger.y + selectTrigger.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(180);
  assert.equal(await page.locator('.m3-select-menu').evaluate((menu) => menu.matches(':popover-open')), true);
  await page.mouse.up();
  assert.equal(await page.locator('.m3-select-menu').evaluate((menu) => menu.matches(':popover-open')), true);
  await page.locator('.m3-select-trigger').click();
  assert.equal(await page.locator('.m3-select-menu').evaluate((menu) => menu.matches(':popover-open')), false);

  console.log('Menu press and drag browser regressions passed.');
} finally {
  await browser?.close();
  await server?.close();
}
