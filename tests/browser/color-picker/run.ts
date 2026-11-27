import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage({ hasTouch: true });
  await openFixture(page, new URL('/tests/browser/color-picker/', server.resolvedUrls!.local[0]).href);
  const trigger = page.getByRole('button', { name: 'Color picker (Color)', exact: true });
  const plane = page.locator('[data-part="plane"]');
  const entry = (name: string) => page.getByRole('textbox', { name, exact: true });
  const hex = entry('Hex');
  const channel = (name: string) => page.getByRole('spinbutton', { name, exact: true });
  const readChannel = async (name: string) => Number(await channel(name).getAttribute('aria-valuenow'));
  const field = entry('Color');
  await field.fill('#abc');
  await field.press('Escape');
  assert.equal(await field.inputValue(), '#2E75D4FF');
  await field.press('Tab');
  assert(await trigger.evaluate((el) => el === document.activeElement));
  await page.keyboard.press('Enter');
  await plane.waitFor();
  assert(await plane.evaluate((el) => el === document.activeElement));
  const surface = page.locator('[role="dialog"] [data-scope="popover"][data-part="surface"]');
  async function checkPanelFits() {
    const bounds = await surface.evaluate((el) => {
      const picker = el.querySelector('[data-scope="color-picker"]')!;
      const rect = el.getBoundingClientRect();
      return {
        width: el.clientWidth,
        height: el.clientHeight,
        contentWidth: el.scrollWidth,
        contentHeight: el.scrollHeight,
        panelWidth: picker.getBoundingClientRect().width,
        visible: rect.x >= -1 && rect.y >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1,
      };
    });
    assert(
      bounds.visible &&
        bounds.contentHeight === bounds.height &&
        bounds.contentWidth === bounds.width &&
        Math.abs(bounds.panelWidth - bounds.width) < 1,
      JSON.stringify(bounds),
    );
  }
  await surface.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
  await checkPanelFits();
  await hex.fill('f00');
  await page.keyboard.press('Escape');
  assert.equal(await hex.inputValue(), '#2E75D4FF');
  assert(await hex.isVisible());
  await hex.fill('00ff0080');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await plane.waitFor({ state: 'hidden' });
  assert(await trigger.evaluate((el) => el === document.activeElement));
  await trigger.press('Space');
  assert.equal(await hex.inputValue(), '#00FF0080');
  await hex.press('End');
  await page.keyboard.press('Backspace');
  assert.equal(await hex.inputValue(), '#00FF008');
  await hex.press('Escape');

  const red = channel('Red');
  await red.hover();
  const redBox = (await red.boundingBox())!;
  await page.mouse.move(redBox.x + redBox.width / 4, redBox.y + redBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(redBox.x + (3 * redBox.width) / 4, redBox.y + redBox.height / 2);
  const draggedRed = await readChannel('Red');
  assert(Math.abs(draggedRed - 128) <= 2, JSON.stringify({ draggedRed, redBox }));
  assert.equal(await hex.inputValue(), '#' + draggedRed.toString(16).toUpperCase() + 'FF0080');
  await page.mouse.up();
  await red.press('Enter');
  await entry('Red').fill('5');
  await entry('Red').press('Escape');
  assert.equal(await readChannel('Red'), draggedRed);
  await page.getByRole('radio', { name: 'RGB', exact: true }).press('ArrowRight');
  // Clicking the diagram commits the focused field before using the other channels.
  await channel('Hue').press('Enter');
  await entry('Hue').fill('240');
  await plane.click({ position: { x: 50, y: 50 } });
  assert.equal(await readChannel('Hue'), 240);
  const settings = page.getByRole('button', { name: /sRGB/ });
  await settings.press('Enter');
  await page.getByRole('menuitemradio', { name: 'Linear sRGB' }).press('Escape');
  assert(await settings.evaluate((el) => el === document.activeElement));
  assert(await plane.isVisible(), 'Escape in settings keeps the picker open');
  await settings.click();
  await page.getByRole('menuitemradio', { name: 'Linear sRGB' }).click();
  assert.match(await settings.innerText(), /Linear sRGB/);
  await settings.click();
  await page.getByRole('menuitemradio', { name: 'HSL wheel' }).click();
  assert.equal(await plane.getAttribute('data-wheel'), 'true');
  await settings.click();
  await page.getByRole('menuitemradio', { name: 'SV + H' }).click();
  await settings.click();
  await page.getByRole('menuitemradio', { name: 'sRGB', exact: true }).click();

  const layoutPage = await browser.newPage();
  await openFixture(layoutPage, new URL('/tests/browser/color-picker/?layouts', server.resolvedUrls!.local[0]).href);
  // Compare a pre-click pixel to the color selected at that position in each host layout.
  for (const id of ['sv-h', 'hs-v', 'hv-s', 'hsv-wheel', 'hsl-wheel']) {
    const picker = layoutPage.locator(`[data-layout="${id}"]`);
    const plane = picker.locator('[data-part="plane"]');
    const hex = picker.getByRole('textbox', { name: 'Hex' });
    await hex.fill('3080c080');
    await hex.press('Enter');
    const image = await plane.screenshot();
    const sample = await layoutPage.evaluate(async (base64) => {
      const blob = await (await fetch('data:image/png;base64,' + base64)).blob();
      const frame = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = frame.width;
      canvas.height = frame.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(frame, 0, 0);
      const x = Math.floor(frame.width * 0.68),
        y = Math.floor(frame.height * 0.32);
      return { x, y, rgb: Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3) };
    }, image.toString('base64'));
    await plane.click({ position: { x: sample.x, y: sample.y } });
    const digits = (await hex.inputValue()).slice(1);
    for (const [i, actual] of sample.rgb.entries()) {
      assert(
        Math.abs(actual - parseInt(digits.slice(i * 2, i * 2 + 2), 16)) <= 5,
        JSON.stringify({ id, sample, digits }),
      );
    }
    assert.equal(digits.slice(6), '80');
  }

  await layoutPage.close();
  await page.bringToFront();
  const hue = page.getByRole('slider', { name: 'Hue' });
  const hb = (await hue.boundingBox())!;
  await page.keyboard.down('Control');
  await page.mouse.click(hb.x + hb.width * 0.37, hb.y + hb.height / 2);
  await page.keyboard.up('Control');
  assert.equal(await readChannel('Hue'), 120);
  await page.keyboard.down('Shift');
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width * 0.75, hb.y + hb.height / 2);
  await page.mouse.up();
  await page.keyboard.up('Shift');
  assert(Math.abs((await readChannel('Hue')) - 129) < 0.3);

  const box = (await plane.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  for (const [type, x, y] of [
    ['touchStart', 0.5, 0.5],
    ['touchMove', 1.08, 0.25],
    ['touchEnd', 0, 0],
  ] as const) {
    await cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x: box.x + box.width * x, y: box.y + box.height * y }],
    });
  }
  assert.equal(await readChannel('Saturation'), 100);
  const beforeWheel = await readChannel('Value');
  assert(Math.abs(beforeWheel - 75) < 1);
  await plane.hover();
  await page.mouse.wheel(0, -30);
  await page.waitForFunction(
    (previous) =>
      Number(document.querySelector<HTMLInputElement>('input[aria-label="Value"]')?.getAttribute('aria-valuenow')) >
      previous,
    beforeWheel,
  );
  await plane.press('Backspace');
  assert.equal(await hex.inputValue(), '#2E75D4FF');

  await page.getByRole('button', { name: 'Copy Hex' }).click();
  await hex.fill('');
  await hex.press('ControlOrMeta+v');
  assert.equal(await hex.inputValue(), '#2E75D4FF');
  await hex.fill('abc');
  await hex.press('ControlOrMeta+a');
  await hex.press('ControlOrMeta+c');
  await hex.fill('');
  await hex.press('ControlOrMeta+v');
  assert.equal(await hex.inputValue(), 'abc');
  await hex.press('Tab');
  await page.getByRole('button', { name: 'Outside' }).click();
  await plane.waitFor({ state: 'hidden' });
  await trigger.click();
  assert.equal(await hex.inputValue(), '#AABBCCFF');
  assert.equal(await field.inputValue(), '#AABBCCFF');
  await plane.press('Escape');
  await field.fill('#1234');
  await field.press('ControlOrMeta+a');
  await field.press('ControlOrMeta+c');
  await field.fill('');
  await field.press('ControlOrMeta+v');
  assert.equal(await field.inputValue(), '#1234');
  await trigger.click();
  assert.equal(await hex.inputValue(), '#11223344');
  assert.equal(await field.inputValue(), '#11223344');
  await page.setViewportSize({ width: 360, height: 640 });
  await trigger.evaluate((el) => {
    el.style.position = 'fixed';
    el.style.inset = '43% 1rem auto auto';
  });
  await checkPanelFits();
  await page.setViewportSize({ width: 740, height: 390 });
  await checkPanelFits();
  console.log('ColorPicker popover, keyboard, touch capture, drag modifiers and diagram colors passed');
} finally {
  await browser.close();
  await server.close();
}
