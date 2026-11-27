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
} finally {
  await browser?.close();
  await server?.close();
}
