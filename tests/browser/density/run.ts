import { openFixture } from '../fonts';

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
let browser;
try {
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
  const page = await browser.newPage({ viewport: { width: 640, height: 1100 } });
  await page.addInitScript('window.__name = (fn) => fn');
  await openFixture(page, new URL('/tests/browser/density/', server.resolvedUrls!.local[0]).href);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  mkdirSync('.tmp/density', { recursive: true });
  const measure = () =>
    page.evaluate(() => {
      const selectors = [
        '[data-testid="button"]',
        '[data-testid="icon"]',
        '[data-testid="chip"]',
        '[data-testid="field"] [data-part="container"]',
        '[data-testid="item"]',
        '[data-scope="tree-item"][data-part="row"]',
        '[role="tab"]',
        '[data-testid="group"]',
      ];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) throw new Error(`Missing density probe: ${selector}`);
        const style = getComputedStyle(el);
        return {
          height: el.getBoundingClientRect().height,
          font: style.fontSize,
          line: style.lineHeight,
          padding: style.paddingInlineStart,
        };
      });
    });
  await page.getByTestId('button').waitFor();
  const initial = await measure();
  const audit = () =>
    page.locator('.audit-probes').evaluate(async (root) => {
      await Promise.all(root.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
      const selectors = [
        '[data-testid="otp-small"] [data-part="input"]',
        '[data-testid="otp-medium"] [data-part="input"]',
        '[data-testid="otp-large"] [data-part="input"]',
        '[data-testid="breadcrumb"]',
        '[data-testid="pagination"]',
        '[data-testid="drawer-item"]',
        '[data-testid="drawer-section"] [data-part="trigger"]',
        '[data-testid="rail-collapsed"]',
        '[data-testid="rail-expanded"]',
      ];
      return selectors.map((selector) => {
        const el = root.querySelector<HTMLElement>(selector)!;
        const style = getComputedStyle(el);
        return { height: el.offsetHeight, width: el.offsetWidth, font: style.fontSize };
      });
    });
  const initialAudit = await audit();
  const pickerActions = () =>
    page
      .locator(
        '[data-scope="date-picker"][data-part="root"] [data-scope="button"], [data-scope="date-range-picker"][data-part="root"] [data-scope="button"], [data-scope="time-picker"][data-part="root"] [data-scope="button"]',
      )
      .evaluateAll((elements) => elements.map((el) => getComputedStyle(el).height));
  const initialPickerActions = await pickerActions();
  assert(initialPickerActions.length >= 6);

  for (const density of [0, -1, -2, -3, -4, -99, 1, 2, 3, 5]) {
    await page
      .locator('.workspace')
      .evaluate((el, value) => (el as HTMLElement).style.setProperty('--md-density', String(value)), density);
    const current = await measure();
    assert.deepEqual(await pickerActions(), initialPickerActions);
    const delta = density * 4;
    const floors = [24, 28, 24, 32, 32, 28, 32, 24];
    current.forEach((value, index) => {
      assert.equal(
        value.height,
        Math.max(floors[index]!, initial[index]!.height + delta),
        `height ${index} at ${density}`,
      );
      assert.equal(value.font, initial[index]!.font);
      assert.equal(value.line, initial[index]!.line);
      if (index === 3) assert.equal(Number.parseFloat(value.padding), Math.max(4, 16 + density * 2));
      else assert.equal(value.padding, initial[index]!.padding);
    });
    for (const direction of ['ltr', 'rtl']) {
      const fields = page.locator('.field-icon-probes');
      await fields.evaluate((el, dir) => el.setAttribute('dir', dir), direction);
      const geometry = await fields.evaluate((root) =>
        [...root.querySelectorAll('[data-part="container"][data-scope="text-field"]')].map((container) => {
          const rect = container.getBoundingClientRect();
          const style = getComputedStyle(container);
          const trailing = container.querySelector('[data-part="trailing"]')!;
          const glyph = trailing.querySelector('[data-scope="icon"], [data-part="icon"]')!;
          const icon = glyph.getBoundingClientRect();
          const action = trailing.querySelector('[data-scope="icon-button"]')?.getBoundingClientRect();
          return {
            size: container.closest('[data-field-size]')!.getAttribute('data-field-size'),
            padding: Number.parseFloat(style.paddingInlineEnd),
            gap: style.direction === 'rtl' ? icon.left - rect.left : rect.right - icon.right,
            actionInside: !action || (action.left >= rect.left && action.right <= rect.right),
          };
        }),
      );
      for (const field of geometry) {
        const base = { 'extra-small': 8, small: 12, medium: 16 }[field.size!];
        assert.equal(field.padding, Math.max(4, base! + density * 2));
        assert(Math.abs(field.gap - field.padding) < 0.1, JSON.stringify({ density, direction, field }));
        assert(field.actionInside, 'Field actions must stay inside the outline');
      }
    }
    const auditValues = await audit();
    const auditFloors = [28, 32, 36, 28, 24, 32, 32, 56, 32];
    auditValues.forEach((value, index) => {
      assert.equal(
        value.height,
        Math.max(auditFloors[index]!, initialAudit[index]!.height + delta),
        `audit ${index} at ${density}`,
      );
      assert.equal(value.width, initialAudit[index]!.width, `width ${index} at ${density}`);
      assert.equal(value.font, initialAudit[index]!.font);
    });
    assert.equal(
      await page.getByTestId('reset').evaluate((el) => el.getBoundingClientRect().height),
      initial[0]!.height,
    );
    assert.equal(
      await page
        .getByTestId('group')
        .locator('[data-scope="button"][data-part="root"]')
        .first()
        .evaluate((el) => el.getBoundingClientRect().height),
      current[7]!.height,
    );
    assert.equal(
      await page.getByRole('button', { name: 'Undo', exact: true }).evaluate((el) => getComputedStyle(el).height),
      '40px',
    );
    const input = page.getByRole('textbox', { name: '名称 Name', exact: true });
    assert.equal(await input.evaluate((el) => getComputedStyle(el).fontSize), '16px');
    assert(await page.getByTestId('multiline').evaluate((el) => el.scrollHeight <= el.clientHeight));
    if (density === 0 || density === -4) await page.screenshot({ path: `.tmp/density/${density}.png`, fullPage: true });
  }
  for (const [size, baseHeight] of [
    ['extra-small', 32],
    ['small', 40],
    ['medium', 48],
    ['large', 56],
    ['extra-large', 64],
  ] as const) {
    await page.getByTestId('row-size').selectOption(size);
    for (const density of [0, -2]) {
      await page
        .locator('.workspace')
        .evaluate((el, value) => (el as HTMLElement).style.setProperty('--md-density', String(value)), density);
      const rows = await audit();
      assert.equal((await measure())[5]!.height, Math.max(28, baseHeight + density * 4), `tree ${size}`);
      for (const index of [5, 6, 8])
        assert.equal(rows[index]!.height, Math.max(32, baseHeight + density * 4), `navigation ${index} ${size}`);
      await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      const command = page.getByRole('menuitem').filter({ has: page.getByText('Command', { exact: true }) });
      await command.waitFor();
      assert.equal(
        await command.evaluate((el) => (el as HTMLElement).offsetHeight),
        Math.max(28, baseHeight + density * 4),
        `menu ${size}`,
      );
      const override = page.getByRole('menuitem', { name: 'Large command', exact: true });
      assert.equal(await override.evaluate((el) => (el as HTMLElement).offsetHeight), 56 + density * 4);
      await page.keyboard.press('Escape');
    }
    await page.locator('.workspace').evaluate((el) => (el as HTMLElement).style.setProperty('--md-density', '0'));
    await page.getByRole('combobox', { name: '分类 Category', exact: true }).click();
    const option = page.getByRole('listbox').getByRole('option').first();
    await option.waitFor();
    assert.equal(await option.evaluate((el) => getComputedStyle(el).minHeight), `${baseHeight}px`);
    await page.keyboard.press('Escape');
  }
  await page.getByTestId('row-size').selectOption('medium');
  await page.locator('.workspace').evaluate((el) => (el as HTMLElement).style.setProperty('--md-density', '-4'));
  // Selection surfaces inherit density from their trigger region.
  for (const name of ['分类 Category', '搜索 Search']) {
    const input = page.getByRole('combobox', { name, exact: true });
    await input.click();
    const row = page.getByRole('listbox').getByRole('option').first();
    await row.waitFor();
    assert.equal(await row.evaluate((el) => getComputedStyle(el).minHeight), '32px');
    await input.press('ArrowDown');
    await input.press('Enter');
    await input.press('Escape');
  }
  for (const density of [0, -2, -99, 2]) {
    await page.locator('.workspace').evaluate((el, value) => {
      (el as HTMLElement).style.setProperty('--md-density', String(value));
    }, density);
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    const row = page.getByRole('menuitem').filter({ has: page.getByText('Command', { exact: true }) });
    await row.waitFor();
    const height = await row.evaluate((el) => (el as HTMLElement).offsetHeight);
    assert.equal(height, Math.max(28, 48 + density * 4));
    const details = page.getByRole('menuitem').filter({ hasText: 'Supporting text remains readable' });
    assert(await details.evaluate((el) => el.scrollHeight <= el.clientHeight));
    assert(await details.evaluate((el, minimum) => (el as HTMLElement).offsetHeight > minimum, height));

    if (density === -2) {
      await page
        .getByRole('menuitem')
        .filter({ has: page.getByText('More commands', { exact: true }) })
        .hover();
      const nested = page.getByRole('menuitem', { name: 'Nested command', exact: true });
      await nested.waitFor();
      assert.equal(await nested.evaluate((el) => (el as HTMLElement).offsetHeight), height);
      await page.keyboard.press('Escape');
      const root = row.locator('xpath=ancestor::*[@data-scope="menu" and @data-part="root"]');
      await root.evaluate((el) => {
        const style = (el as HTMLElement).style;
        style.setProperty('--md-menus-menu-item-height', '60px');
        style.setProperty('--md-menus-menu-item-top-space', '10px');
        style.setProperty('--md-menus-menu-item-bottom-space', '10px');
      });
      assert.equal(await row.evaluate((el) => (el as HTMLElement).offsetHeight), 60);
      await root.evaluate((el) => {
        const style = (el as HTMLElement).style;
        style.removeProperty('--md-menus-menu-item-height');
        style.removeProperty('--md-menus-menu-item-top-space');
        style.removeProperty('--md-menus-menu-item-bottom-space');
      });
    }
    await page.keyboard.press('Escape');
  }
  await page.locator('.workspace').evaluate((el) => (el as HTMLElement).style.setProperty('--md-density', '-4'));
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await dialog.evaluate(async (el) => {
    await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
  });
  assert.equal(
    await dialog.getByRole('button', { name: 'Close dialog' }).evaluate((el) => el.getBoundingClientRect().height),
    40,
  );
  assert.equal(
    await dialog
      .locator('[data-scope="text-field"][data-part="container"]')
      .evaluate((el) => el.getBoundingClientRect().height),
    56,
  );
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  // Explicit geometry overrides win over density; removing them restores density.
  const field = page.getByTestId('field');
  await field.evaluate((el) =>
    (el as HTMLElement).style.setProperty('--md-outlined-text-field-container-height', '60px'),
  );
  assert.equal((await measure())[3]!.height, 60);
  await field.evaluate((el) => (el as HTMLElement).style.removeProperty('--md-outlined-text-field-container-height'));
  assert.equal((await measure())[3]!.height, 40);
  await page.setViewportSize({ width: 360, height: 1100 });
  assert(
    await page.locator('.workspace').evaluate((el) => el.scrollWidth <= el.clientWidth),
    JSON.stringify(
      await page.locator('.workspace').evaluate((root) =>
        [...root.querySelectorAll('*')]
          .filter((el) => el.getBoundingClientRect().right > root.getBoundingClientRect().right)
          .map((el) => ({
            scope: el.getAttribute('data-scope'),
            part: el.getAttribute('data-part'),
            width: el.getBoundingClientRect().width,
          }))
          .slice(0, 20),
      ),
    ),
  );
  // All action sizes retain their actual content even after whitespace is exhausted.
  for (const row of await page.locator('[data-size-probe]').all()) {
    const button = row.locator('[data-scope="button"][data-part="root"]');
    const group = row.locator('[data-scope="button-group"]');
    const buttonHeight = await button.evaluate((el) => {
      const style = getComputedStyle(el);
      const height = el.getBoundingClientRect().height;
      if (
        height <
        parseFloat(style.lineHeight) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) + 4
      )
        throw new Error('Clipped action text');
      return height;
    });
    assert.equal(await group.evaluate((el) => el.getBoundingClientRect().height), buttonHeight);
    const iconButton = row.locator('[data-scope="icon-button"][data-part="root"]');
    assert(
      await iconButton.evaluate((el) => {
        const icon = el.querySelector('[data-part="icon"]')!;
        return el.getBoundingClientRect().height >= icon.getBoundingClientRect().height + 4;
      }),
    );
  }
  const stackedTab = page.locator('.size-probes [role="tab"]');
  assert(
    await stackedTab.evaluate((el) => {
      const content = el.querySelector('[data-part="trigger-content"]')!;
      return el.getBoundingClientRect().height >= content.getBoundingClientRect().height + 8;
    }),
  );

  // The standalone compact theme includes its typography and density.
  await page.locator('.workspace').evaluate((el) => (el as HTMLElement).style.removeProperty('--md-density'));
  const themeStyle = await page.addStyleTag({ content: readFileSync('src/styles/themes/compact.css', 'utf8') });
  assert.equal(
    await page.getByRole('textbox', { name: '名称 Name', exact: true }).evaluate((el) => getComputedStyle(el).fontSize),
    '12px',
  );
  assert.equal((await measure())[3]!.height, 42);
  await themeStyle.evaluate((el) => el.remove());
  // Larger typography grows the content floor instead of being clipped at an arbitrary pixel minimum.
  await page.locator('.workspace').evaluate((el) => {
    const style = (el as HTMLElement).style;
    style.setProperty('--md-density', '-99');
    for (const role of [
      'body-large',
      'body-medium',
      'label-large',
      'label-medium',
      'title-small',
      'title-medium',
      'title-large',
    ]) {
      style.setProperty(`--md-sys-typescale-${role}-size`, '32px');
      style.setProperty(`--md-sys-typescale-${role}-line-height`, '48px');
    }
  });
  const enlarged = await measure();
  assert(enlarged[0]!.height >= 52);
  assert(enlarged[3]!.height >= 56);
  assert(enlarged[5]!.height >= 56);
  assert(enlarged[6]!.height >= 56);
  const enlargedAudit = await audit();
  assert(enlargedAudit[5]!.height >= 56, 'Drawer keeps large labels');
  assert(enlargedAudit[7]!.height >= 88, 'Collapsed rail keeps stacked content');
  assert(enlargedAudit[8]!.height >= 56, 'Expanded rail keeps large labels');
  const otp = page.getByTestId('otp-medium');
  await otp.evaluate((el) => (el as HTMLElement).style.setProperty('--md-input-otp-input-text-line-height', '48px'));
  assert((await audit())[1]!.height >= 56);
  await otp.evaluate((el) => (el as HTMLElement).style.setProperty('--md-input-otp-medium-container-size', '70px'));
  assert.equal((await audit())[1]!.height, 70);
  console.log(
    'Density: scale, bounds, inheritance, reset, typography, multiline content, selection, dialog and token overrides passed.',
  );
} finally {
  await browser?.close();
  await server.close();
}
