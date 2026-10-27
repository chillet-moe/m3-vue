import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

type VisualStyle = {
  backgroundColor: string;
  boxShadow: string;
  color: string;
  cursor: string;
};

const componentNames = ['button', 'icon-button', 'fab', 'list-item'] as const;

const fixturePath = '/tests/browser/button-disabled-link/';
const systemChromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;

const readVisualStyle = (page: Page, selector: string) =>
  page.locator(selector).evaluate<VisualStyle>((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      boxShadow: style.boxShadow,
      color: style.color,
      cursor: style.cursor,
    };
  });

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
  const serverUrl = server.resolvedUrls?.local[0];
  assert(serverUrl, 'Vite did not expose a local development URL');

  await openFixture(page, new URL(fixturePath, serverUrl).href, { waitUntil: 'networkidle' });

  for (const componentName of componentNames) {
    const nativeSelector = `.${componentName}-native-disabled`;
    const linkSelector = `.${componentName}-link-disabled`;
    const nativeControl = page.locator(nativeSelector);
    const linkControl = page.locator(linkSelector);

    await nativeControl.waitFor();
    assert.equal(await nativeControl.evaluate((element) => element.tagName), 'BUTTON');
    assert.equal(await linkControl.evaluate((element) => element.tagName), 'A');
    assert.equal(await linkControl.getAttribute('href'), null);
    assert.equal(await linkControl.getAttribute('aria-disabled'), 'true');
    assert.equal(await linkControl.getAttribute('tabindex'), '-1');

    const nativeStyle = await readVisualStyle(page, nativeSelector);
    assert.deepEqual(
      await readVisualStyle(page, linkSelector),
      nativeStyle,
      `${componentName}: disabled styles differ`,
    );

    const linkBox = await linkControl.boundingBox();
    assert(linkBox, `${componentName}: disabled link should have a rendered box`);
    await page.mouse.move(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2);
    assert.deepEqual(
      await readVisualStyle(page, linkSelector),
      nativeStyle,
      `${componentName}: hover should preserve disabled styles`,
    );
  }

  console.log('Disabled link action browser regressions passed.');
} finally {
  await browser?.close();
  await server?.close();
}
