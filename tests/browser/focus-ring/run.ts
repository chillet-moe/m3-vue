import assert from 'node:assert/strict';
import { chromium, type Locator, type Page } from 'playwright';
import { createServer } from 'vite';
import { openFixture } from '../fonts';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
let browser;

async function pixelPaint(page: Page, x: number, y: number) {
  const png = await page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } });
  return page.evaluate(async (base64) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
    const context = new OffscreenCanvas(1, 1).getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    return [...context.getImageData(0, 0, 1, 1).data];
  }, png.toString('base64'));
}

async function edgePaint(page: Page, control: Locator) {
  const box = await control.boundingBox();
  assert(box);
  return pixelPaint(page, box.x - 4, box.y + box.height / 2);
}

async function captureRing(page: Page, control: Locator) {
  await control.evaluate(async (el) => {
    await Promise.allSettled(el.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });
  const box = await control.boundingBox();
  assert(box);
  return page.screenshot({
    clip: { x: box.x - 6, y: box.y - 6, width: Math.ceil(box.width) + 12, height: Math.ceil(box.height) + 12 },
  });
}

async function auditKeyboardHandoffs(page: Page) {
  const audit = page.locator('#keyboard-audit');
  const start = page.locator('#keyboard-audit-start');
  const end = page.locator('#keyboard-audit-end');
  const controls = [
    ['button', 'Tab button'],
    ['button', 'Tab icon button'],
    ['button', 'Tab chip'],
    ['checkbox', 'Tab checkbox'],
    ['link', 'Tab checkbox link'],
    ['radio', 'Tab radio'],
    ['checkbox', 'Tab switch'],
    ['button', 'Tab FAB'],
    ['button', 'Tab list item'],
    ['button', 'Tab rail item'],
    ['button', 'Tab drawer item'],
    ['link', 'Tab breadcrumb'],
    ['tab', 'Tab trigger'],
  ] as const;
  await audit.evaluate((region) => {
    const sample = (focused: HTMLElement, attribute = 'data-frame') => {
      if (document.activeElement !== focused) return;
      const visible = Array.from(document.querySelectorAll('.m3-focus-ring:popover-open')).filter((ring) => {
        const style = getComputedStyle(ring);
        return style.visibility === 'visible' && style.opacity !== '0';
      });
      const ring = visible[0];
      const target = ring?.parentElement;
      const ringBox = ring?.getBoundingClientRect();
      const targetBox = target?.getBoundingClientRect();
      const frame = {
        visible: visible.length,
        ownsRing: Boolean(target && target.closest('[data-m3-focus-ring]') === focused.closest('[data-m3-focus-ring]')),
        aligned: Boolean(
          ringBox &&
          targetBox &&
          (['x', 'y', 'width', 'height'] as const).every((edge) => Math.abs(ringBox[edge] - targetBox[edge]) < 0.5),
        ),
        plainOutlines: [...new Set([focused, ...region.querySelectorAll('[data-m3-focus-ring-target], input')])]
          .filter((el) => getComputedStyle(el).outlineStyle !== 'none')
          .map((el) => el.getAttribute('data-part') ?? el.tagName),
        ringAnimationCount: ring?.getAnimations().length ?? 0,
      };
      region.setAttribute(attribute, JSON.stringify(frame));
      if (
        region.hasAttribute('data-audit-burst') &&
        focused.closest('[data-m3-focus-ring]') &&
        (frame.visible !== 1 ||
          !frame.ownsRing ||
          !frame.aligned ||
          frame.plainOutlines.length ||
          frame.ringAnimationCount)
      ) {
        region.setAttribute('data-burst-failure', JSON.stringify(frame));
      }
    };
    region.addEventListener('focusin', (event) => {
      requestAnimationFrame(() => sample(event.target as HTMLElement));
    });

    const start = region.querySelector('#keyboard-audit-start')!;
    start.addEventListener(
      'keydown',
      (event) => {
        if ((event as KeyboardEvent).key !== 'Tab') return;
        event.preventDefault();
        const next = start.parentElement!.querySelector<HTMLButtonElement>(':scope > div button')!;
        // App-managed keyboard focus can change partway through a rendering frame.
        requestAnimationFrame(() => next.focus());
        requestAnimationFrame(() => sample(next, 'data-managed-frame'));
      },
      { once: true },
    );
  });

  const firstFrame = async (attribute = 'data-frame') => {
    await page.waitForFunction((name) => document.querySelector('#keyboard-audit')!.hasAttribute(name), attribute);
    return JSON.parse((await audit.getAttribute(attribute))!);
  };
  const expected = { visible: 1, ownsRing: true, aligned: true, plainOutlines: [], ringAnimationCount: 0 };
  const assertOutsideStroke = async (name: string) => {
    const { x, y, edge, color } = await audit.locator('.m3-focus-ring:popover-open:visible').evaluate((ring) => {
      const box = ring.getBoundingClientRect();
      const style = getComputedStyle(ring);
      const clip = ring.closest('#keyboard-audit > div')!;
      return {
        x: box.x - parseFloat(style.outlineOffset) - parseFloat(style.outlineWidth) / 2,
        y: box.y + box.height / 2,
        edge: clip.getBoundingClientRect().left,
        color: style.outlineColor,
      };
    });
    const rgb = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
    assert(rgb && Math.round(x) < edge, `${name} has a focus stroke outside the clip`);
    assert.deepEqual(await pixelPaint(page, x, y), [...rgb.slice(1).map(Number), 255], name);
  };
  const clearFrame = () => audit.evaluate((el) => el.removeAttribute('data-frame'));
  await start.focus();
  await clearFrame();
  await page.keyboard.press('Tab');
  assert(
    await page.getByRole('button', { name: 'Tab button', exact: true }).evaluate((el) => el === document.activeElement),
    'Managed Tab reaches the first control.',
  );
  assert.deepEqual(
    await firstFrame('data-managed-frame'),
    expected,
    'Tab focus set during a frame paints the full top-layer ring in that frame.',
  );
  await assertOutsideStroke('Tab button');

  for (const [role, name] of controls.slice(1)) {
    await clearFrame();
    await page.keyboard.press('Tab');
    const control = page.getByRole(role, { name, exact: true });
    assert(await control.evaluate((el) => el === document.activeElement), name);
    assert.deepEqual(await firstFrame(), expected, `${name} shows exactly one ring on its first frame`);
    if (['Tab icon button', 'Tab chip', 'Tab radio', 'Tab switch', 'Tab FAB'].includes(name)) {
      await assertOutsideStroke(name);
    }
  }

  await audit.evaluate((el) => el.setAttribute('data-audit-burst', ''));
  for (const [key, from, to] of [
    ['Shift+Tab', end, start],
    ['Tab', start, end],
  ] as const) {
    await from.focus();
    for (let step = 0; step <= controls.length; step++) await page.keyboard.press(key);
    assert(await to.evaluate((el) => el === document.activeElement), `${key} crosses every control without pauses`);
    await to.evaluate(() => new Promise(requestAnimationFrame));
    assert.equal(await page.locator('.m3-focus-ring:popover-open').count(), 0, `${key} leaves no stale focus rings`);
    assert.equal(
      await audit.getAttribute('data-burst-failure'),
      null,
      `${key} paints no invalid frame during the burst`,
    );
  }
}

try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable',
    ignoreDefaultArgs: ['--hide-scrollbars'],
    args: ['--disable-features=OverlayScrollbar'],
  });
  const url = new URL('/tests/browser/focus-ring/', server.resolvedUrls!.local[0]).href;
  const page = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.addInitScript('window.__name = (fn) => fn');
  await openFixture(page, url);
  const action = page.getByRole('button', { name: 'Action', exact: true });
  const ring = action.locator('> .m3-focus-ring');
  const clip = page.locator('#app-clip');
  const magenta = [192, 0, 128, 255];

  await page.keyboard.press('Tab');
  await ring.waitFor();
  assert(await action.evaluate((el) => el === document.activeElement && getComputedStyle(el).outlineStyle === 'none'));
  const ringStyle = await ring.evaluate((el) => {
    const style = getComputedStyle(el);
    return [style.outlineWidth, style.outlineOffset, style.outlineColor, style.borderRadius];
  });
  assert.deepEqual(ringStyle.slice(0, 3), ['3px', '2px', 'rgb(192, 0, 128)']);
  assert.equal(ringStyle[3], await action.evaluate((el) => getComputedStyle(el).borderRadius));
  assert.deepEqual(await edgePaint(page, action), magenta, 'The outer stroke crosses the transformed scrollport edge.');
  const promotedImage = await captureRing(page, action);

  const initialBox = (await action.boundingBox())!;
  await clip.evaluate((el) => (el.scrollTop = 8));
  await page.waitForFunction(() => {
    const button = document.querySelector('#app-clip button')!;
    const ring = button.querySelector('.m3-focus-ring')!;
    return button.getBoundingClientRect().y === ring.getBoundingClientRect().y;
  });
  assert.equal((await action.boundingBox())!.y, initialBox.y - 8);
  assert.deepEqual(await edgePaint(page, action), magenta, 'The ring follows the control when the host scrolls.');

  await clip.evaluate((el) => (el.scrollTop = 60));
  assert.notDeepEqual(await edgePaint(page, action), magenta, 'A fully scrolled-out control leaves no floating ring.');
  await clip.evaluate((el) => (el.scrollTop = 8));

  await action.evaluate((el) => ((el as HTMLElement).style.outline = '2px solid blue'));
  assert.equal(await action.evaluate((el) => getComputedStyle(el).outlineColor), 'rgb(0, 0, 255)');
  assert.deepEqual(await edgePaint(page, action), magenta, 'The application can paint its own outline independently.');

  await page.keyboard.press('Tab');
  const toggle = page.getByRole('checkbox', { name: 'Toggle action' });
  assert(await toggle.evaluate((el) => el === document.activeElement));
  await ring.waitFor({ state: 'detached' });
  await page.locator('.m3-focus-ring:popover-open').waitFor();
  await page.getByRole('button', { name: 'Next' }).click();
  await action.click();
  await action.locator('> .m3-focus-ring:popover-open').waitFor({ state: 'attached' });
  assert.equal(await ring.evaluate((el) => getComputedStyle(el).visibility), 'hidden', 'Pointer focus paints no ring.');
  await page.keyboard.press('Tab');
  await clip.evaluate((el) => (el.scrollTop = 0));
  await page.locator('#dialog').evaluate((el: HTMLDialogElement) => el.showModal());
  await page.keyboard.press('Tab');
  const modalAction = page.getByRole('button', { name: 'In dialog' });
  await modalAction.locator('> .m3-focus-ring').waitFor();
  assert.deepEqual(await edgePaint(page, modalAction), magenta, 'The decoration paints above a native modal dialog.');

  const fallback = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await fallback.addInitScript(() => Reflect.deleteProperty(ToggleEvent.prototype, 'source'));
  await openFixture(fallback, url);
  await fallback.locator('#app-clip').evaluate((el) => ((el as HTMLElement).style.overflow = 'visible'));
  await fallback.keyboard.press('Tab');
  const original = fallback.getByRole('button', { name: 'Action', exact: true });
  const originalStyle = await original.evaluate((el) => {
    const style = getComputedStyle(el);
    return [style.outlineWidth, style.outlineOffset, style.outlineColor, style.borderRadius];
  });
  assert.deepEqual(originalStyle, ringStyle, 'Without implicit anchors the original outline remains available.');
  assert.deepEqual(await edgePaint(fallback, original), magenta);
  const originalImage = await captureRing(fallback, original);
  const ringDifference = await page.evaluate(
    async ([original, promoted]) => {
      const pixels = async (base64: string) => {
        const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
        const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext('2d')!;
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      };
      const [before, after] = await Promise.all([pixels(original!), pixels(promoted!)]);
      return before.reduce((difference, channel, index) => Math.max(difference, Math.abs(channel - after[index]!)), 0);
    },
    [originalImage.toString('base64'), promotedImage.toString('base64')],
  );
  assert(
    ringDifference <= 8,
    `The original and elevated ring images match within antialiasing tolerance (${ringDifference}).`,
  );

  await page.locator('#dialog').evaluate((el: HTMLDialogElement) => el.close());
  const custom = page.getByRole('button', { name: 'Custom action' });
  await custom.focus();
  await custom.locator('> .m3-focus-ring:popover-open').waitFor();
  assert.deepEqual(await edgePaint(page, custom), magenta, 'An application-owned control can use the shared ring.');
  await custom.press('Enter');
  const updatedCustom = page.getByRole('button', { name: 'Updated custom action' });
  await updatedCustom.locator('> .m3-focus-ring:popover-open').waitFor();
  assert.deepEqual(await edgePaint(page, updatedCustom), magenta, 'The ring survives a custom control text update.');

  const customInput = page.getByRole('textbox', { name: 'Custom input' });
  await customInput.focus();
  const inputSurface = page.locator('#input-surface');
  await inputSurface.locator('> .m3-focus-ring:popover-open').waitFor();
  assert.equal(await customInput.evaluate((el) => getComputedStyle(el).outlineStyle), 'none');
  assert.deepEqual(await edgePaint(page, inputSurface), magenta, 'An input can delegate its ring to a visual wrapper.');
  assert.equal(
    await customInput.evaluate((el: HTMLInputElement) => {
      el.style.outline = '2px solid blue';
      return getComputedStyle(el).outlineColor;
    }),
    'rgb(0, 0, 255)',
    'A wrapper only suppresses the native default outline.',
  );

  const directInput = page.getByRole('textbox', { name: 'Direct input' });
  await directInput.focus();
  assert.equal(await directInput.evaluate((el) => getComputedStyle(el).outlineStyle), 'solid');

  const switchInput = page.getByRole('checkbox', { name: 'Switch action' });
  await switchInput.focus();
  const trackRing = page.locator('.m3-switch-control > .m3-focus-ring:popover-open');
  await trackRing.waitFor();
  const trackGeometry = await trackRing.evaluate((el) => {
    const track = el.parentElement!;
    const target = track.getBoundingClientRect();
    const ring = el.getBoundingClientRect();
    return [
      ring.x - target.x,
      ring.y - target.y,
      ring.width - target.width,
      ring.height - target.height,
      getComputedStyle(el).outlineOffset,
    ];
  });
  assert.deepEqual(
    trackGeometry,
    [0, 0, 0, 0, '2px'],
    'The Switch ring follows its visual track rather than its hit area.',
  );

  await page.addStyleTag({
    content: 'html { overflow: scroll; } ::-webkit-scrollbar { width: 14px; height: 11px; }',
  });
  assert.deepEqual(
    await page.evaluate(() => [
      innerWidth - document.documentElement.clientWidth,
      innerHeight - document.documentElement.clientHeight,
    ]),
    [14, 11],
    'Both scrollbars reserve space in the layout viewport.',
  );

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const axis of ['horizontal-ltr', 'horizontal-rtl', 'vertical-ltr', 'vertical-rtl']) {
    const input = page.getByRole('slider', { name: axis });
    const entry = await input.evaluate(async (el: HTMLInputElement) => {
      el.focus();
      await new Promise(requestAnimationFrame);
      const ring = el.parentElement!.querySelector('.m3-focus-ring:popover-open')!;
      const style = getComputedStyle(ring);
      return { visibility: style.visibility, width: style.outlineWidth, offset: style.outlineOffset };
    });
    const width = axis.startsWith('vertical') ? '2px' : '4px';
    assert.deepEqual(
      entry,
      { visibility: 'visible', width, offset: width },
      `${axis} paints the full ring immediately`,
    );
    const handle = page.locator('.m3-slider:focus-within [data-part="handle"]');
    assert.equal(await input.evaluate((el) => getComputedStyle(el).outlineStyle), 'none', axis);
    if (axis === 'horizontal-ltr') {
      const box = await handle.boundingBox();
      const clip = await page.locator('#slider-clip').boundingBox();
      assert(box && clip);
      const y = box.y - 6;
      assert(y < clip.y, 'The sampled stroke lies outside the clipping container.');
      const color = await handle
        .locator('> .m3-focus-ring:popover-open')
        .evaluate((el) => getComputedStyle(el).outlineColor);
      const rgb = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/);
      assert(rgb);
      assert.deepEqual(
        await pixelPaint(page, box.x + box.width / 2, y),
        [...rgb.slice(1).map(Number), 255],
        'The Slider ring paints outside its clipping container.',
      );
    }
    const startValue = await input.inputValue();
    await input.press('ArrowUp');
    assert.notEqual(await input.inputValue(), startValue);
    const error = await handle.evaluate(async (el) => {
      let deviation = 0;
      const ring = el.querySelector('.m3-focus-ring')!;
      for (let frame = 0; frame < 12; frame++) {
        await new Promise(requestAnimationFrame);
        const native = el.getBoundingClientRect();
        const elevated = ring.getBoundingClientRect();
        for (const edge of ['top', 'right', 'bottom', 'left'] as const) {
          deviation = Math.max(deviation, Math.abs(native[edge] - elevated[edge]));
        }
      }
      return deviation;
    });
    assert(error < 0.5, `${axis} ring follows the moving slider handle (${error}px)`);

    const exit = await input.evaluate(async (el: HTMLInputElement) => {
      const handle = el.parentElement!.querySelector('[data-part="handle"]')!;
      const ring = handle.querySelector('.m3-focus-ring')!;
      el.blur();
      const hiddenOnBlur = !ring.isConnected || getComputedStyle(ring).visibility === 'hidden';
      const handleOutline = getComputedStyle(handle).outlineStyle;
      await new Promise(requestAnimationFrame);
      return { hiddenOnBlur, handleOutline, detached: !ring.isConnected };
    });
    assert.deepEqual(
      exit,
      { hiddenOnBlur: true, handleOutline: 'none', detached: true },
      `${axis} hides the ring on blur and removes it at the next frame`,
    );
  }

  const pointerSlider = page.getByRole('slider', { name: 'horizontal-ltr' });
  await pointerSlider.click();
  assert(
    await pointerSlider.evaluate(async (el) => {
      await new Promise(requestAnimationFrame);
      const ring = el.parentElement!.querySelector('.m3-focus-ring');
      return !ring || getComputedStyle(ring).visibility === 'hidden';
    }),
    'Pointer focus leaves the Slider ring hidden.',
  );

  const keyboardPage = await browser.newPage({
    viewport: { width: 1000, height: 1000 },
    reducedMotion: 'no-preference',
  });
  await keyboardPage.addInitScript('window.__name = (fn) => fn');
  await openFixture(keyboardPage, `${url}?keyboard-audit`);
  await auditKeyboardHandoffs(keyboardPage);
  console.log(
    'Focus rings retain their geometry across clipping, native dialogs, custom components and moving targets.',
  );
} finally {
  await browser?.close();
  await server.close();
}
