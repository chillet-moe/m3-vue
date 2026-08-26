import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer, type ViteDevServer } from 'vite-plus';

type LayoutSnapshot = {
  content: {
    clientHeight: number;
    scrollHeight: number;
  };
  legends: Array<{
    clientHeight: number;
    clientWidth: number;
    lineHeight: string;
    maxInlineSize: string;
    overflow: string;
    scrollHeight: number;
    whiteSpace: string;
  }>;
};

const fixturePath = '/tests/browser/text-field-outline/';
const systemChromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;

const snapshotLayout = (page: Page) =>
  page.evaluate<LayoutSnapshot>(() => {
    const content = document.querySelector<HTMLElement>('.m3-dialog-content');
    if (!content) {
      throw new Error('Missing fixture element: .m3-dialog-content');
    }

    return {
      content: {
        clientHeight: content.clientHeight,
        scrollHeight: content.scrollHeight,
      },
      legends: Array.from(document.querySelectorAll<HTMLElement>('.m3-text-field-outline legend')).map((legend) => {
        const style = getComputedStyle(legend);
        return {
          clientHeight: legend.clientHeight,
          clientWidth: legend.clientWidth,
          lineHeight: style.lineHeight,
          maxInlineSize: style.maxInlineSize,
          overflow: style.overflow,
          scrollHeight: legend.scrollHeight,
          whiteSpace: style.whiteSpace,
        };
      }),
    };
  });

const assertNoFalseVerticalOverflow = (snapshot: LayoutSnapshot, state: string) => {
  assert.equal(
    snapshot.content.scrollHeight,
    snapshot.content.clientHeight,
    `${state}: Dialog content should not have false vertical overflow`,
  );
};

const waitForNotchTransition = (page: Page) => page.waitForTimeout(350);

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

  await page.goto(new URL(fixturePath, serverUrl).href, { waitUntil: 'networkidle' });
  await page.waitForSelector('.m3-dialog[open] .m3-dialog-content');
  await waitForNotchTransition(page);

  const collapsed = await snapshotLayout(page);
  assertNoFalseVerticalOverflow(collapsed, 'empty');
  assert.equal(collapsed.legends.length, 2);
  for (const legend of collapsed.legends) {
    assert.equal(legend.clientHeight, 0);
    assert(
      legend.scrollHeight <= Math.ceil(Number.parseFloat(legend.lineHeight)),
      'A collapsed legend should keep its hidden label to a single line',
    );
    assert.equal(legend.overflow, 'clip');
    assert.equal(legend.whiteSpace, 'nowrap');
  }

  await page.evaluate(() => window.__textFieldOutlineFixture.setOptions({ value: 'Populated' }));
  await waitForNotchTransition(page);
  const populated = await snapshotLayout(page);
  assertNoFalseVerticalOverflow(populated, 'populated');
  assert(populated.legends[0]!.clientWidth > collapsed.legends[0]!.clientWidth, 'Populated notch should expand');

  await page.evaluate(() => window.__textFieldOutlineFixture.setOptions({}));
  await page.locator('.m3-text-field-input').first().focus();
  await waitForNotchTransition(page);
  const focused = await snapshotLayout(page);
  assertNoFalseVerticalOverflow(focused, 'focused');
  assert(focused.legends[0]!.clientWidth > collapsed.legends[0]!.clientWidth, 'Focused notch should expand');

  await page.locator('.m3-text-field-input').first().blur();
  for (const [state, options] of [
    ['visually focused', { visuallyFocused: true }],
    ['placeholder', { placeholder: 'Optional' }],
    ['always-float label', { alwaysFloatLabel: true }],
  ] as const) {
    await page.evaluate((nextOptions) => window.__textFieldOutlineFixture.setOptions(nextOptions), options);
    await waitForNotchTransition(page);
    const expanded = await snapshotLayout(page);
    assertNoFalseVerticalOverflow(expanded, state);
    assert(expanded.legends[0]!.clientWidth > collapsed.legends[0]!.clientWidth, `${state}: notch should expand`);
  }

  console.log('TextField outline browser regression passed.');
} finally {
  await browser?.close();
  await server?.close();
}
