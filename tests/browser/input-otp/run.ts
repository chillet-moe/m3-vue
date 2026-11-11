import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage();
  const url = new URL('/tests/browser/input-otp/', server.resolvedUrls!.local[0]).href;
  const cells = page.locator('.m3-input-otp-input');
  const group = page.getByRole('group');
  for (const method of ['input', 'paste']) {
    await openFixture(page, url);
    await cells.first().focus();
    if (method === 'input') {
      await page.keyboard.insertText('😺');
    } else {
      await cells.first().evaluate((element) => {
        const data = new DataTransfer();
        data.setData('text', '😺');
        element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
      });
    }
    assert.deepEqual(
      await cells.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value)),
      ['😺', ''],
    );
    assert.equal(await group.getAttribute('data-complete'), 'false');
    assert.equal(await page.getByTestId('completed').textContent(), '[]');
    assert(await cells.nth(1).evaluate((element) => element === document.activeElement));

    await page.keyboard.insertText('A');
    assert.equal(await page.locator('input[name="code"]').inputValue(), '😺A');
    assert.equal(await group.getAttribute('data-complete'), 'true');
    assert.equal(await page.getByTestId('completed').textContent(), '["😺A"]');

    await cells.first().focus();
    await page.keyboard.press('Delete');
    assert.equal(await page.locator('input[name="code"]').inputValue(), 'A');
    assert.equal(await group.getAttribute('data-complete'), 'false');
    assert.equal(await page.getByTestId('completed').textContent(), '["😺A"]');
  }
  console.log('OTP native input, paste and completion use Unicode code points.');
} finally {
  await browser.close();
  await server.close();
}
