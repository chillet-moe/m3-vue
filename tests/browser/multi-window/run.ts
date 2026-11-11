import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
let browser: Browser | undefined;
let server: ViteDevServer | undefined;
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const executablePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(executablePath) ? { executablePath } : {}), headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(7000);
  page.setDefaultNavigationTimeout(15000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, new URL('/tests/browser/multi-window/', server.resolvedUrls!.local[0]).href);
  const popup = page.waitForEvent('popup');
  await page.evaluate(() => (window as any).multiWindow.open());
  const child = await popup;
  child.setDefaultTimeout(7000);
  child.on('pageerror', (error) => errors.push(error.message));
  assert((await page.evaluate(() => (window as any).multiWindow.childListeners().length)) > 0);
  await child.locator('.dialog-trigger').click();
  await page.locator('.dialog-trigger').click();
  assert.equal(await child.locator('dialog').evaluate((element: HTMLDialogElement) => element.open), true);
  assert.equal(await page.locator('dialog').evaluate((element: HTMLDialogElement) => element.open), true);
  await child.getByRole('button', { name: 'Finish', exact: true }).click();
  await child.waitForFunction(() => document.querySelector('.results')?.textContent === 'done');
  assert.equal(await page.locator('dialog').evaluate((element: HTMLDialogElement) => element.open), true);
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await page.locator('.snackbar-trigger').click();
  await child.locator('.snackbar-trigger').click();
  assert.equal(await page.locator('.m3-snackbar-stack-popover').getAttribute('data-position'), 'bottom');
  assert.equal(await child.locator('.m3-snackbar-stack-popover').getAttribute('data-position'), 'top');
  await child.getByRole('button', { name: 'Finish', exact: true }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await page.evaluate(() => {
    const api = (window as any).multiWindow;
    for (const reverse of [false, true]) {
      const releases = api.lock();
      if (document.body.style.overflow !== 'hidden' || api.child.document.body.style.overflow !== 'hidden')
        throw new Error('Both documents must lock');
      releases[reverse ? 1 : 0]();
      const other = reverse ? document : api.child.document;
      if (other.body.style.overflow !== 'hidden') throw new Error('Other lock released');
      releases[reverse ? 0 : 1]();
      if (document.body.style.overflow === 'hidden' || api.child.document.body.style.overflow === 'hidden')
        throw new Error('Lock leaked');
    }
  });
  await child.locator('.menu-trigger').click();
  await child.getByRole('menuitem', { name: 'First', exact: true }).focus();
  await child.keyboard.press('ArrowDown');
  assert.equal(await child.evaluate(() => document.activeElement?.textContent?.trim()), 'Second');
  await child.keyboard.press('Enter');
  assert.equal(await child.locator('.selected').textContent(), 'second');
  await child.locator('.menu-trigger').click();
  await child.getByRole('menuitem', { name: 'More', exact: true }).focus();
  await child.keyboard.press('ArrowRight');
  await child.getByRole('menuitem', { name: 'Nested', exact: true }).waitFor({ state: 'visible' });
  await child.keyboard.press('ArrowLeft');
  assert.match(await child.evaluate(() => document.activeElement?.textContent ?? ''), /More/);
  await child.keyboard.press('Escape');
  assert.equal(await child.evaluate(() => document.activeElement?.classList.contains('menu-trigger')), true);

  const layer = child.getByRole('combobox', { name: 'Window layers', exact: true });
  await layer.click();
  await child.keyboard.press('ArrowDown');
  await child.keyboard.press('End');
  await child.keyboard.press('Enter');
  assert.equal(await layer.inputValue(), 'Layer 39');

  // Foreign-realm nodes and CustomEvent must work with the shared module instance.
  await child.evaluate(() => {
    const menu = document.querySelector('#window-menu')!;
    menu.dispatchEvent(new CustomEvent('m3-dropdown:show', { detail: { focus: 'last' } }));
    const outside = document.createElement('button');
    outside.id = 'foreign-outside';
    outside.textContent = 'Outside';
    document.body.append(outside);
  });
  await child.locator('#foreign-outside').click();
  assert.equal(await child.locator('#window-menu').evaluate((el) => el.matches(':popover-open')), false);
  const triggerBox = await child.locator('.menu-trigger').boundingBox();
  assert(triggerBox);
  await child.mouse.move(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
  await child.mouse.down();
  await child.mouse.move(triggerBox.x + triggerBox.width / 2 + 8, triggerBox.y + triggerBox.height / 2 + 8);
  const firstBox = await child.getByRole('menuitem', { name: 'First', exact: true }).boundingBox();
  assert(firstBox);
  await child.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, { steps: 5 });
  await child.mouse.up();
  assert.equal(await child.locator('.selected').textContent(), 'first');
  await child.bringToFront();
  await child.locator('.tooltip-trigger').focus();
  await child.locator('.tooltip-trigger').hover();
  await child.getByRole('tooltip').waitFor({ state: 'visible' });
  await child.locator('.tooltip-trigger').click();
  assert((await child.locator('.ripple').count()) > 0);
  const slider = child.locator('input[type="range"]');
  await slider.focus();
  await child.keyboard.press('ArrowRight');
  assert.equal(await child.locator('.value').textContent(), '26');
  const sliderBox = await slider.boundingBox();
  assert(sliderBox);
  await child.mouse.move(sliderBox.x + sliderBox.width * 0.26, sliderBox.y + sliderBox.height / 2);
  await child.mouse.down();
  await child.mouse.move(sliderBox.x + sliderBox.width * 0.8, sliderBox.y + sliderBox.height / 2, { steps: 8 });
  await child.mouse.up();
  assert(Number(await child.locator('.value').textContent()) > 60);
  await slider.focus();
  assert.equal(await child.locator('[data-value-indicator]').evaluate((el) => el.matches(':popover-open')), true);
  await page.evaluate(() => (window as any).multiWindow.unmount('main'));
  await child.locator('.snackbar-trigger').click();
  await child.locator('.dialog-trigger').click();
  await page.evaluate(() => (window as any).multiWindow.move('child', 'main'));
  await page.waitForFunction(() => document.querySelector('dialog')?.matches(':modal'));
  assert.equal(await child.evaluate(() => document.body.style.overflow), '');
  assert.equal(await page.locator('.m3-snackbar-stack-popover').evaluate((el) => el.matches(':popover-open')), true);
  await page.locator('dialog').getByRole('button', { name: 'Finish' }).click();
  await page.locator('.m3-snackbar').getByRole('button', { name: 'Finish' }).click();
  await page.locator('.menu-trigger').click();
  await page.getByRole('menuitem', { name: 'First', exact: true }).click();
  assert.equal(await page.locator('.selected').textContent(), 'first');
  await page.evaluate(() => {
    (window as any).initialContextLabel = new WeakRef(document.querySelector('[data-testid="initial-context-label"]')!);
  });
  const contextTrigger = page.getByTestId('context-trigger');
  await contextTrigger.click();
  await contextTrigger.click();
  assert.equal(await page.getByTestId('initial-context-label').count(), 0);
  const heap = await page.context().newCDPSession(page);
  await heap.send('HeapProfiler.collectGarbage');
  await heap.send('HeapProfiler.collectGarbage');
  assert.equal(await page.evaluate(() => (window as any).initialContextLabel.deref() === undefined), true);
  await heap.detach();
  await contextTrigger.click({ button: 'right' });
  const openContextMenu = page.locator('#window-context-menu:popover-open');
  await openContextMenu.getByRole('menuitem', { name: 'Context action' }).waitFor();
  await page.mouse.click(2, 2);
  await openContextMenu.waitFor({ state: 'detached' });
  const adoptedLayer = page.getByRole('combobox', { name: 'Window layers', exact: true });
  await adoptedLayer.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  assert.equal(await adoptedLayer.inputValue(), 'Layer 1');

  const adoptedSlider = page.locator('[data-scope="slider"][data-part="root"]');
  const handleBeforeResize = await adoptedSlider.locator('[data-part="handle"]').boundingBox();
  assert(handleBeforeResize);
  const resizedWidth = await adoptedSlider.evaluate((root: HTMLElement) => {
    const width = root.clientWidth - 80;
    root.style.inlineSize = `${width}px`;
    return width;
  });
  await page.waitForFunction(
    ({ width, previousX }) => {
      const root = document.querySelector('[data-scope="slider"][data-part="root"]');
      const handle = root?.querySelector('[data-part="handle"]');
      return root?.clientWidth === width && handle && previousX - handle.getBoundingClientRect().x >= 40;
    },
    { width: resizedWidth, previousX: handleBeforeResize.x },
  );

  await page.locator('.tooltip-trigger').hover();
  await page.getByRole('tooltip').waitFor({ state: 'visible' });
  assert.equal(await child.locator('.vtt-popover').count(), 0);
  assert.equal(await child.evaluate(() => document.documentElement.classList.contains('js')), false);
  assert.deepEqual(
    await page.evaluate(() => (window as any).multiWindow.childListeners()),
    [],
    'Old window listeners must be released after adoption',
  );
  await page.evaluate(() => (window as any).multiWindow.detach('child'));
  // A later task adopts a subtree that is no longer observed by its source Document.
  await page.waitForTimeout(30);
  await page.evaluate(() => (window as any).multiWindow.move('child', 'child'));
  await child.locator('.tooltip-trigger').focus();
  await child.getByRole('tooltip').waitFor({ state: 'visible' });
  assert.equal(await child.locator('m3-document-adoption-sentinel').count(), 0);
  assert.deepEqual(await page.evaluate(() => (window as any).multiWindow.updateDropdownAcrossDocuments()), {
    initiallyOpen: false,
    opensAfterAdoption: true,
    opensAfterClear: false,
    restoredAnchor: '--authored-anchor',
    opensAfterReset: true,
  });
  assert.deepEqual(await page.evaluate(() => (window as any).multiWindow.adoptFromRemovedSubtree()), [
    'bound to source',
    'released source',
    'bound to destination',
  ]);
  const detachedBinding = await page.evaluateHandle(() => (window as any).multiWindow.releaseDetachedBinding());
  const bindingHeap = await page.context().newCDPSession(page);
  await bindingHeap.send('HeapProfiler.collectGarbage');
  await bindingHeap.send('HeapProfiler.collectGarbage');
  assert(
    await detachedBinding.evaluate(({ reference }) => reference.deref() === undefined),
    'Released elements must be collectible while the adoption sentinel registry is still alive',
  );
  await detachedBinding.evaluate(({ frame }) => frame.remove());
  await detachedBinding.dispose();
  await bindingHeap.detach();
  await page.evaluate(() => (window as any).multiWindow.mountExtra());
  await page.locator('.dialog-trigger').click();
  await child.locator('.snackbar-trigger').click();
  await child.locator('.dialog-trigger').click();
  await page.evaluate(() => (window as any).multiWindow.child.close());

  await page.waitForFunction(
    () =>
      (window as any).multiWindow.state('child').results.filter((value: string) => value.includes('disposed'))
        .length === 2,
  );
  const closedState = await page.evaluate(() => (window as any).multiWindow.state('child'));
  assert.equal(closedState.unmounted, false, 'Closing a browser window must not be mistaken for Vue unmount');
  assert.deepEqual(
    await page.evaluate(() => (window as any).multiWindow.childListeners()),
    [],
    'Closed window listeners must be released',
  );
  const mainState = await page.evaluate(() => (window as any).multiWindow.state('main'));
  assert.equal(mainState.unmounted, true, 'Explicit unmount executes Vue lifecycle');
  assert.equal(await page.locator('dialog').evaluate((element: HTMLDialogElement) => element.open), true);
  await page.evaluate(() => (window as any).multiWindow.unmount('child'));
  await page.getByRole('button', { name: 'Finish', exact: true }).click();

  // A fresh page loads its own Vue and m3-vue module instances.
  const independent = await browser.newPage();
  independent.setDefaultTimeout(7000);
  independent.on('pageerror', (error) => errors.push(error.message));
  await openFixture(independent, page.url());
  await independent.locator('.dialog-trigger').click();
  await page.locator('.dialog-trigger').click();
  await independent.getByRole('button', { name: 'Finish', exact: true }).click();
  assert.equal(await page.locator('dialog').evaluate((element: HTMLDialogElement) => element.open), true);
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await independent.locator('.snackbar-trigger').click();
  await page.locator('.snackbar-trigger').click();
  assert.equal(await independent.locator('.m3-snackbar-stack-popover').getAttribute('data-position'), 'bottom');
  assert.equal(await page.locator('.m3-snackbar-stack-popover').getAttribute('data-position'), 'top');
  await independent.close();
  await page
    .getByLabel('Window snackbar', { exact: true })
    .getByRole('button', { name: 'Finish', exact: true })
    .click();

  const oldOverlayDocument = await page.evaluateHandle(() => (window as any).multiWindow.adoptOverlaysFromIframe());
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const overlayHeap = await page.context().newCDPSession(page);
  await overlayHeap.send('HeapProfiler.collectGarbage');
  await overlayHeap.send('HeapProfiler.collectGarbage');
  assert.equal(
    await oldOverlayDocument.evaluate((document: WeakRef<Document>) => document.deref() === undefined),
    true,
    'Adopted overlays must release their original document while the host and pending action are still alive',
  );
  await oldOverlayDocument.dispose();
  await page.evaluate(() => {
    const api = (window as any).multiWindow;
    api.finishIframeAction();
    api.unmount('overlay-adoption');
  });

  const oldSnackbarPayload = await page.evaluateHandle(() => (window as any).multiWindow.retireFirstSnackbar());
  await page.waitForFunction(() => {
    const items = document.querySelectorAll('[data-position="top-end"] [data-stack-item-id]');
    return items.length === 1 && items[0]?.textContent?.includes('Surviving notification');
  });
  await overlayHeap.send('HeapProfiler.collectGarbage');
  await overlayHeap.send('HeapProfiler.collectGarbage');
  assert.equal(
    await oldSnackbarPayload.evaluate((payload: WeakRef<object>) => payload.deref() === undefined),
    true,
    'An active stack must release the action payload of its retired first snackbar',
  );
  await oldSnackbarPayload.dispose();
  await overlayHeap.detach();
  await page.locator('[data-position="top-end"]').getByRole('button', { name: 'Dismiss notification' }).click();

  assert.deepEqual(errors, []);
  console.log('Multi-window browser regressions passed.');
} finally {
  await browser?.close();
  await server?.close();
}
