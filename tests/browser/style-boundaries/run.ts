import assert from 'node:assert/strict';
import { chromium, type Locator } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
let browser;

function readStyle(locator: Locator, properties: string[], pseudo?: string) {
  return locator.evaluate(
    (element, { properties, pseudo }) => {
      const style = getComputedStyle(element, pseudo);
      return properties.map((property) => style.getPropertyValue(property));
    },
    { properties, pseudo },
  );
}

try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await page.addInitScript('window.__name = (fn) => fn');
  await openFixture(page, new URL('/tests/browser/style-boundaries/', server.resolvedUrls!.local[0]).href);
  const inside = page.getByTestId('inside');
  const outside = page.getByTestId('outside');

  for (const [selector, properties] of [
    ['[data-scope="button"][data-part="root"]', ['color', 'background-color']],
    ['[data-scope="text-field"][data-part="outline"]', ['border-width', 'border-color']],
    ['[data-scope="select"] [data-scope="text-field"][data-part="outline"]', ['border-width', 'border-color']],
    ['[data-scope="menu"][data-part="divider"]', ['border-width', 'margin-block']],
    ['[data-scope="pagination"][data-part="content"]', ['padding-inline-start', 'list-style-type']],
    ['[data-scope="breadcrumb"][data-part="list"]', ['padding-inline-start', 'list-style-type']],
  ] as const) {
    const a = await readStyle(inside.locator(selector).first(), [...properties]);
    const b = await readStyle(outside.locator(selector).first(), [...properties]);
    assert.deepEqual(a, b, selector);
  }

  for (const name of ['Button link', 'List item link', 'Link inside card', 'Custom widget link']) {
    const link = inside.getByRole('link', { name, exact: true });
    await link.hover();
    assert.deepEqual(await readStyle(link, ['border-bottom-width']), ['0px'], name);
  }

  await page.keyboard.press('Tab');
  for (const name of ['Button link', 'List item link']) {
    const link = inside.getByRole('link', { name, exact: true });
    await link.focus();
    assert.deepEqual(await readStyle(link, ['border-bottom-width', 'outline-style']), ['0px', 'solid'], name);
  }

  for (const name of ['Article link', 'Link in nested prose']) {
    const link = inside.getByRole('link', { name, exact: true });
    await link.hover();
    assert.deepEqual(await readStyle(link, ['border-bottom-width']), ['1px'], name);
  }
  assert.deepEqual(await readStyle(inside.getByTestId('article-list'), ['list-style-type', 'padding-inline-start']), [
    'disc',
    '26px',
  ]);
  assert.deepEqual(await readStyle(inside.getByTestId('article-rule'), ['border-bottom-width']), ['1px']);
  assert.deepEqual(await readStyle(inside.getByTestId('article-table').locator('td'), ['padding-block-start']), [
    '14px',
  ]);

  const passiveCard = page.getByTestId('passive-card');
  const clickableCard = page.getByTestId('clickable-card');
  const cardGeometry = ['padding', 'width', 'height'];
  assert.deepEqual(await readStyle(clickableCard, cardGeometry), await readStyle(passiveCard, cardGeometry));

  const cardSubmissions = page.getByTestId('card-submissions');
  await clickableCard.click();
  await clickableCard.press('Enter');
  assert.equal(await cardSubmissions.textContent(), '0', 'Clickable Card must not submit its form by default');
  await page.getByTestId('submit-card').click();
  assert.equal(await cardSubmissions.textContent(), '1', 'An explicit submit type must still submit the form');

  for (const [name, display] of [
    ['selection-group', 'block'],
    ['button-group', 'inline-flex'],
    ['chip-group', 'flex'],
  ]) {
    const group = page.getByTestId(name!);
    assert.equal(await group.evaluate((el) => el.tagName), 'FIELDSET');
    assert.deepEqual(await readStyle(group, ['border-width', 'padding', 'margin', 'min-inline-size', 'display']), [
      '0px',
      '0px',
      '0px',
      '0px',
      display,
    ]);
  }

  for (const [name, radius, indicator, clip] of [
    ['custom', '12px'],
    ['indicator-override', '12px', '5px', '5px'],
    ['first-one', '18px 18px 8px 8px', undefined, '18px 18px 8px 8px'],
    ['last-one', '8px 8px 22px 22px'],
    ['first-two', '30px 30px 8px 8px'],
    ['last-two', '8px 8px 34px 34px', undefined, '8px 8px 34px 34px'],
    ['square-first', '12px 12px 5px 5px', undefined, '12px 12px 5px 5px'],
    ['square-last', '5px 5px 4px 4px'],
    ['only-rounded', '19px 19px 23px 23px'],
    ['nested', '28px', undefined, '28px'],
  ] as const) {
    const row = page.getByTestId(name);
    assert.deepEqual(await readStyle(row, ['border-radius']), [radius], name);
    assert.deepEqual(await readStyle(row, ['border-radius'], '::before'), [indicator ?? radius], name);
    if (name !== 'only-rounded') {
      assert.deepEqual(await readStyle(row, ['border-radius'], '::after'), [radius], name);
    }
    if (clip) {
      assert.deepEqual(await readStyle(row, ['clip-path'], '::before'), [`inset(0px 0% round ${clip})`], name);
    }
  }
  assert.deepEqual(await readStyle(page.getByTestId('square-middle'), ['border-radius']), ['5px']);
  console.log('Prose boundaries, native Card and selection group defaults, and independent list group corners passed.');
} finally {
  await browser?.close();
  await server.close();
}
