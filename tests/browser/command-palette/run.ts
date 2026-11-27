import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser, type Locator } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import { openFixture } from '../fonts';

let browser: Browser | undefined;
let server: ViteDevServer | undefined;
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ executablePath: existsSync(chrome) ? chrome : undefined });
  const page = await browser.newPage({ viewport: { width: 640, height: 480 } });
  await openFixture(page, new URL('/tests/browser/command-palette/', server.resolvedUrls!.local[0]).href);

  const trigger = page.getByRole('button', { name: 'Find commands' });
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  const search = palette.getByRole('combobox', { name: 'Search commands' });
  const list = palette.getByRole('listbox');
  const active = list.getByRole('option', { selected: true });
  const log = page.locator('#executed');
  const focused = (el: Locator) => el.evaluate((node) => node === node.ownerDocument.activeElement);

  await trigger.click();
  assert(await focused(search));
  assert.equal(await active.textContent(), 'SaveFile');
  assert(await list.getByRole('option', { name: 'Delete' }).isDisabled());
  await search.press('ArrowDown');
  assert.equal(await active.textContent(), 'SaveWorkspace');
  assert.equal(await search.getAttribute('aria-activedescendant'), await active.getAttribute('id'));
  assert(await focused(search));
  await search.press('Enter');
  await palette.waitFor({ state: 'hidden' });
  assert.equal(await log.textContent(), 'workspace');

  await trigger.click();
  await search.fill('sav');
  await list.getByRole('option', { name: 'Save File' }).click();
  await palette.waitFor({ state: 'hidden' });
  assert.equal(await log.textContent(), 'workspace,file');

  await trigger.click();
  assert.equal(await search.inputValue(), '');
  const searchBox = await search.boundingBox();
  await search.press('ArrowUp');
  assert.equal(await active.textContent(), 'Action 39');
  const bottomRow = await active.boundingBox();
  const scrollport = await list.boundingBox();
  assert(bottomRow && scrollport && bottomRow.y + bottomRow.height <= scrollport.y + scrollport.height + 1);
  assert(await list.evaluate((node) => node.scrollTop > 0));
  assert.deepEqual(await search.boundingBox(), searchBox);
  assert(await focused(search));
  await search.press('Escape');
  await palette.waitFor({ state: 'hidden' });
  assert(await focused(trigger));

  await trigger.click();
  await page.mouse.click(2, 2);
  await palette.waitFor({ state: 'hidden' });
  assert(await focused(trigger));

  await trigger.click();
  const session = await page.context().newCDPSession(page);
  await session.send('Input.imeSetComposition', { text: 'she', selectionStart: 3, selectionEnd: 3 });
  for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'Escape']) {
    const unhandled = await search.evaluate(
      (input, key) =>
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, isComposing: true })),
      key,
    );
    assert(unhandled, `IME must receive ${key}`);
    assert.equal(await active.textContent(), 'SaveFile');
  }
  // Native Escape dismissal is a separate cancelable dialog event.
  assert.equal(await palette.evaluate((el) => el.dispatchEvent(new Event('cancel', { cancelable: true }))), false);
  await session.send('Input.insertText', { text: '设置' });
  assert.equal(await search.inputValue(), '设置');
  assert.equal(await active.textContent(), 'Preferences');
  assert.equal(await log.textContent(), 'workspace,file');
  await search.press('Enter');
  const theme = page.getByRole('textbox', { name: 'Theme' });
  await theme.waitFor();
  const preferences = page.getByRole('dialog', { name: 'Preferences' });
  assert(
    await preferences.evaluate((dialog) => dialog.contains(document.activeElement)),
    'Preferences should own focus',
  );
  await theme.press('Escape');
  await theme.waitFor({ state: 'hidden' });

  await trigger.click();
  await search.fill('focus');
  await search.press('Enter');
  await palette.waitFor({ state: 'hidden' });
  assert(await focused(page.getByRole('textbox', { name: 'Editor' })));
  assert.equal(await log.textContent(), 'workspace,file,preferences,focus');

  await trigger.click();
  await search.fill('save');
  await search.press('ArrowDown');
  await page.evaluate(() =>
    window.setCommands([
      { id: 'workspace', name: 'Save changes' },
      { id: 'new', name: 'Save copy' },
    ]),
  );
  assert.equal(await active.textContent(), 'Save changes');
  await page.evaluate(() =>
    window.setCommands([
      { id: 'workspace', name: 'Save changes', disabled: true },
      { id: 'new', name: 'Save copy' },
    ]),
  );
  assert.equal(await active.textContent(), 'Save copy');
  await page.evaluate(() => window.setCommands([{ id: 'locked', name: 'Save read-only', disabled: true }]));
  assert.equal(await search.getAttribute('aria-activedescendant'), null);
  await search.press('ArrowUp');
  await search.press('Enter');
  await list.getByRole('option').click({ force: true });
  assert(await palette.isVisible());
  await search.fill('unknown');
  assert.equal(await list.getByRole('option').count(), 0);
  assert.equal(await palette.getByRole('status').textContent(), 'No matching commands');
  await search.press('ArrowDown');
  await search.press('Enter');
  assert(await focused(search));
  assert.equal(await log.textContent(), 'workspace,file,preferences,focus');
  await page.evaluate(() => window.setCommands([{ id: 'found', name: 'Unknown format' }]));
  assert.equal(await active.textContent(), 'Unknown format');
  assert.equal(await search.getAttribute('aria-activedescendant'), await active.getAttribute('id'));

  const url = new URL('/tests/browser/command-palette/?virtual', server.resolvedUrls!.local[0]);
  await openFixture(page, url.href);
  await page.evaluate(() =>
    window.setCommands(
      Array.from({ length: 3000 }, (_, index) => ({
        id: String(index),
        name: 'Action ' + index,
        disabled: index === 2998,
      })),
    ),
  );
  await trigger.click();

  // Wait for the logical selection to be both mounted and fully within the list's viewport.
  async function expectVirtualActive(index: number, count = 3000) {
    await page.waitForFunction(
      ({ index, count }) => {
        const input = document.querySelector('[role=combobox]')!;
        const list = document.getElementById(input.getAttribute('aria-controls')!)!;
        const option = document.getElementById(input.getAttribute('aria-activedescendant') ?? '');
        if (!option || !list.contains(option) || document.activeElement !== input) return false;
        const row = option.getBoundingClientRect();
        const viewport = list.getBoundingClientRect();
        return (
          option.getAttribute('aria-posinset') === String(index + 1) &&
          option.getAttribute('aria-setsize') === String(count) &&
          option.getAttribute('aria-selected') === 'true' &&
          row.top >= viewport.top - 1 &&
          row.bottom <= viewport.bottom + 1
        );
      },
      { index, count },
      { timeout: 5000 },
    );
  }
  await expectVirtualActive(0);
  assert((await list.getByRole('option').count()) < 40);
  await search.press('ArrowUp');
  await expectVirtualActive(2999);
  assert(await list.evaluate((el) => el.scrollTop > 0));

  // Check the relationship exposed to assistive technology in Chromium's accessibility tree.
  const ax = await session.send('Accessibility.getFullAXTree');
  const combo = ax.nodes.find((node) => node.role?.value === 'combobox');
  const lastOption = ax.nodes.find((node) => node.role?.value === 'option' && node.name?.value === 'Action 2999');
  assert(lastOption?.backendDOMNodeId);
  assert.equal(
    combo?.properties?.find((p) => p.name === 'activedescendant')?.value.relatedNodes?.[0]?.backendDOMNodeId,
    lastOption.backendDOMNodeId,
  );

  await search.press('ArrowUp');
  await expectVirtualActive(2997);
  // Scrolling the active option out of the mounted range must clear its accessibility reference.
  await list.evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForFunction(() => !document.querySelector('[role=combobox]')!.hasAttribute('aria-activedescendant'));
  await search.press('ArrowDown');
  await expectVirtualActive(2999);
  await search.press('ArrowDown');
  await expectVirtualActive(0);
  // Cross the lower viewport edge one row at a time (including rows already in overscan).
  for (let index = 1; index <= 16; index++) {
    await search.press('ArrowDown');
    await expectVirtualActive(index);
  }
  await search.fill('Action 2999');
  await expectVirtualActive(0, 1);
  await search.fill('');
  await expectVirtualActive(0);
  await search.press('ArrowUp');
  await expectVirtualActive(2999);
  await search.press('Enter');
  await palette.waitFor({ state: 'hidden' });
  assert.equal(await log.textContent(), '2999');

  await page.evaluate(() =>
    window.setCommands(
      Array.from({ length: 3000 }, (_, index) => ({
        id: String(index),
        name: 'Action ' + index,
        disabled: index !== 0,
      })),
    ),
  );
  await trigger.click();
  await expectVirtualActive(0);
  await list.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForFunction(() => !document.querySelector('[role=combobox]')!.hasAttribute('aria-activedescendant'));
  await search.press('ArrowDown');
  await expectVirtualActive(0);
} finally {
  await browser?.close();
  await server?.close();
}
