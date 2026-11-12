import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Locator } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
let browser;
try {
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.addInitScript('window.__name = (fn) => fn');
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, new URL('/tests/browser/select-validation/', server.resolvedUrls!.local[0]).href);

  const checkValidity = (form: Locator) => form.evaluate((element) => (element as HTMLFormElement).checkValidity());
  const submit = (form: Locator) => form.getByRole('button', { name: 'Submit' }).click();
  const requestSubmit = (form: Locator) => form.evaluate((element) => (element as HTMLFormElement).requestSubmit());
  const submissions = (form: Locator) => form.locator('output').textContent();
  const plain = page.locator('#plain');
  const plainTrigger = plain.getByRole('combobox');
  await plain.getByRole('button', { name: 'Submit' }).focus();
  assert.equal(await checkValidity(plain), false, 'an unselected readonly field fails constraint validation');
  assert.equal(await page.locator(':focus').textContent(), 'Submit', 'checking validity keeps focus');
  assert.equal(await plainTrigger.getAttribute('aria-invalid'), null, 'checking validity does not reveal the error');
  await submit(plain);
  await plain.locator('[role="combobox"][aria-invalid="true"]:focus').waitFor();
  assert.equal(await submissions(plain), '[]', 'an invalid form must not submit');
  const descriptionId = await plainTrigger.getAttribute('aria-describedby');
  assert(descriptionId);
  assert(
    await page.locator(`[id="${descriptionId}"]`).textContent(),
    'the visible trigger describes the validation error',
  );

  await plainTrigger.click();
  await plain.getByRole('option', { name: 'Empty identifier' }).click();
  assert.equal(await checkValidity(plain), true, 'an authored empty-string identifier is a selected value');
  assert.equal(await plainTrigger.getAttribute('aria-invalid'), null);
  await plain.evaluate((element) => (element as HTMLFormElement).reset());
  await submit(plain);
  assert.equal(await submissions(plain), '[[""]]');
  await plain.getByRole('button', { name: 'Clear selection' }).click();
  assert.equal(await checkValidity(plain), false, 'clearing restores the required constraint');

  for (const id of ['filterable', 'combobox']) {
    const form = page.locator(`#${id}`);
    const trigger = form.getByRole('combobox');
    await trigger.fill('Unknown');
    assert.equal(await checkValidity(form), false, 'the query cannot satisfy a required selection');
    await requestSubmit(form);
    await form.locator('[role="combobox"][aria-invalid="true"]:focus').waitFor();
    assert.equal(await submissions(form), '[]');
    await trigger.fill('Zero');
    await form.getByRole('option', { name: 'Zero' }).click();
    await trigger.fill('Unknown');
    assert.equal(await checkValidity(form), true, 'an existing selection remains valid while editing the query');
    await requestSubmit(form);
    assert.equal(await submissions(form), '[["0"]]');
  }

  const external = page.locator('#external');
  assert.equal(await checkValidity(external), true);
  await submit(external);
  assert.equal(await submissions(external), '[["unloaded","0",""]]', 'external form receives the ordered model values');
  await page.getByRole('button', { name: 'Toggle disabled' }).click();
  await submit(external);
  assert.equal(await submissions(external), '[["unloaded","0",""],[]]', 'disabled controls do not submit a value');
  await page.getByRole('button', { name: 'Clear external' }).click();
  assert.equal(await checkValidity(external), true, 'disabled controls do not block submission');
  await page.getByRole('button', { name: 'Toggle disabled' }).click();
  assert.equal(await checkValidity(external), false, 're-enabled empty multiple selections are required');
  await submit(external);
  await page.locator('[role="combobox"][aria-invalid="true"]:focus').waitFor();
  assert.equal(await submissions(external), '[["unloaded","0",""],[]]');
  assert.deepEqual(errors, []);
  console.log('Select validation: readonly, filterable and external forms use the selected model.');
} finally {
  await browser?.close();
  await server.close();
}
