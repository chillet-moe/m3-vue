import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
try {
  const page = await browser.newPage();
  await page.addInitScript('window.__name = fn => fn');
  await openFixture(page, new URL('/tests/browser/selection-density/', server.resolvedUrls!.local[0]).href);
  for (const density of [0, -2, -4, -99, 3]) {
    await page
      .locator('main')
      .evaluate((el, density) => el.style.setProperty('--md-density', String(density)), density);
    const smallTrack = 24 + Math.max(-4, Math.min(4, density));
    assert.equal(
      await page
        .getByTestId('switch-small')
        .locator('[data-part="control"]')
        .evaluate((el) => el.getBoundingClientRect().height),
      Math.max(smallTrack + 8, 32 + density * 2),
    );
    for (const [id, expected] of [
      ['switch-small-presentation', smallTrack],
      ['switch-presentation', 32 + Math.max(-4, Math.min(4, density))],
    ] as const) {
      assert.equal(await page.getByTestId(id).evaluate((el) => el.getBoundingClientRect().height), expected);
    }
    const switchRoot = page.getByTestId('switch');
    const track = 32 + Math.max(-4, Math.min(4, density));
    const metrics = await switchRoot.locator('[data-part="control"]').evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      width: el.getBoundingClientRect().width,
      track: parseFloat(getComputedStyle(el, '::before').height),
    }));
    assert.equal(metrics.height, Math.max(track + 8, 40 + density * 2));
    assert.equal(metrics.width, (track * 52) / 32);
    assert.equal(metrics.track, track);
    await switchRoot.locator('input').focus();
    await page.keyboard.press('Space');
    assert(await switchRoot.locator('input').isChecked());
    // Read layout sizes, independent of the handle's in-flight spatial transition.
    await page.waitForTimeout(350);
    const handle = await switchRoot.locator('[data-part="handle"]').evaluate((el) => {
      const control = el.parentElement!.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      return {
        width: box.width,
        right: control.right - box.right,
        hover: parseFloat(getComputedStyle(el, '::before').width),
      };
    });
    assert(Math.abs(handle.width - (track * 24) / 32) < 0.1);
    assert(Math.abs(handle.right - (track * 4) / 32) < 0.1);
    assert.equal(handle.hover, metrics.height);
    await page.keyboard.press('Space');
    assert.equal(await switchRoot.locator('input').isChecked(), false);
    for (const [kind, shapeSize] of [
      ['checkbox', 18],
      ['radio', 20],
    ] as const) {
      const control = page.getByTestId(kind).locator('[data-part="control"]');
      const geometry = await control.evaluate((el) => ({
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      }));
      const visibleSize = shapeSize + Math.max(-4, Math.min(4, density));
      const target = Math.max(visibleSize + 8, 40 + density * 2);
      assert.deepEqual(geometry, { width: target, height: target });
      assert.equal(
        await page.getByTestId(`${kind}-presentation`).evaluate((el) => el.getBoundingClientRect().width),
        visibleSize,
      );
    }
  }
  for (const fontSize of [12, 18]) {
    await page.locator('main').evaluate((el, size) => {
      el.style.setProperty('--md-sys-typescale-body-medium-size', `${size}px`);
      el.style.setProperty('--md-density', '-2');
    }, fontSize);
    for (const [kind, part, base] of [
      ['checkbox', 'box', 18],
      ['radio', 'outer', 20],
      ['switch', 'control', 32],
    ] as const) {
      const expected = (base * fontSize) / 14 - 2;
      const actual = await page
        .getByTestId(kind)
        .locator(`[data-part="${part}"]`)
        .evaluate(
          (el, kind) =>
            kind === 'switch' ? parseFloat(getComputedStyle(el, '::before').height) : el.getBoundingClientRect().height,
          kind,
        );
      assert(Math.abs(actual - expected) < 0.05, `${kind} follows custom typography`);
    }
  }
  await page.locator('main').evaluate((el) => el.style.removeProperty('--md-sys-typescale-body-medium-size'));
  // At the content floor, the whole label still activates the native input, including by keyboard.
  await page.locator('main').evaluate((el) => {
    el.style.setProperty('--md-density', '-99');
    el.style.setProperty('--md-icon-scale', '2');
  });
  const checkbox = page.getByRole('checkbox', { name: 'Check option' });
  const labelBounds = await page.getByTestId('checkbox').boundingBox();
  assert(labelBounds);
  await page.mouse.click(labelBounds.x + labelBounds.width - 4, labelBounds.y + labelBounds.height / 2);
  assert(await checkbox.isChecked());
  await checkbox.focus();
  await page.keyboard.press('Space');
  assert.equal(await checkbox.isChecked(), false);
  const radio = page.getByRole('radio', { name: 'Radio option' });
  await radio.focus();
  await page.keyboard.press('Space');
  assert(await radio.isChecked());
  for (const [kind, shapeToken, shapePart, shapeSize] of [
    ['checkbox', '--md-checkbox-container-size', 'box', 14],
    ['radio', '--md-radio-icon-size', 'outer', 16],
  ] as const) {
    const root = page.getByTestId(kind);
    assert.equal(
      await root.locator(`[data-part="${shapePart}"]`).evaluate((el) => el.getBoundingClientRect().width),
      shapeSize,
    );
    await root.evaluate((el, token) => (el as HTMLElement).style.setProperty(token, '30px'), shapeToken);
    assert.equal(await root.locator('[data-part="control"]').evaluate((el) => el.getBoundingClientRect().width), 38);
    await root.evaluate(
      (el, token) => (el as HTMLElement).style.setProperty(token, '52px'),
      `--md-${kind}-target-size`,
    );
    assert.equal(await root.locator('[data-part="control"]').evaluate((el) => el.getBoundingClientRect().width), 52);
  }
  console.log(
    'Selection density: target geometry, proportional shapes, presentation, overrides and label/keyboard activation passed.',
  );
} finally {
  await browser.close();
  await server.close();
}
