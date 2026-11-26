import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium, type Locator } from 'playwright';
import { openFixture } from '../fonts';

// Run against the Styling guide so the preview and the copyable example stay under test together.
const base = process.env.DOCS_URL ?? 'http://127.0.0.1:5173';
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ executablePath: existsSync(chrome) ? chrome : undefined });

function resolveStyle(scope: Locator, value: string, property = 'color') {
  return scope.evaluate(
    (el, { value, property }) => {
      const probe = document.createElement('span');
      probe.style.setProperty(property, value);
      el.append(probe);
      const result = getComputedStyle(probe).getPropertyValue(property);
      probe.remove();
      return result;
    },
    { value, property },
  );
}

async function paint(button: Locator) {
  return button.evaluate(async (el) => {
    // Sample the settled paint, including transitions on the state-layer pseudo-element.
    await Promise.allSettled(
      el
        .getAnimations({ subtree: true })
        .filter((a) => a instanceof CSSTransition)
        .map((a) => a.finished),
    );
    const style = getComputedStyle(el);
    const layer = getComputedStyle(el, '::after');
    return {
      background: style.backgroundColor,
      label: getComputedStyle(el.querySelector('[data-part="text"]')!).color,
      layer: layer.backgroundColor,
      opacity: Number(layer.opacity),
      display: layer.display,
    };
  });
}

try {
  const page = await browser.newPage({ colorScheme: 'light', viewport: { width: 1280, height: 900 } });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page, `${base}/guides/styling`);
  const button = (name: string) => page.getByRole('button', { name, exact: true });
  const remove = page
    .locator('.file-actions [data-scope="button"][data-part="root"]')
    .filter({ hasText: 'Delete file' });
  const selected = page.getByRole('checkbox', { name: 'Select file' });
  const card = page.locator('.reminder-card');
  const root = page.locator('body');
  const fileActions = page.locator('.file-actions');
  const role = (scope: Locator, name: string) => resolveStyle(scope, `var(--md-sys-color-${name})`);
  const colorsByMode: string[][] = [];
  mkdirSync('.tmp/local-colors', { recursive: true });

  for (const scheme of ['light', 'dark'] as const) {
    if (scheme === 'dark') await button('Switch to dark mode').click();
    await remove.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const primary = await resolveStyle(root, 'var(--md-sys-color-primary)');
    assert.equal(primary, await resolveStyle(root, `var(--md-sys-color-primary-${scheme})`));

    const normal = await paint(remove);
    assert.equal(normal.opacity, 0);
    assert.equal(normal.background, await role(remove, 'primary'));
    assert.equal(normal.label, await role(remove, 'on-primary'));
    assert.notEqual(normal.background, primary);
    // An enclosing interactive surface may already supply a state-layer color.
    await fileActions.evaluate((el) => el.style.setProperty('--md-state-layer-color', 'var(--md-sys-color-tertiary)'));
    const checkActivePaint = async (state: string) => {
      const active = await paint(remove);
      assert.equal(active.background, normal.background);
      assert.equal(active.label, normal.label);
      assert.equal(active.layer, normal.label);
      const opacity = await remove.evaluate(
        (el, state) => Number(getComputedStyle(el).getPropertyValue(`--md-sys-state-${state}-state-layer-opacity`)),
        state,
      );
      assert(opacity > 0);
      assert.equal(active.opacity, opacity, state);
    };
    await remove.hover();
    await checkActivePaint('hover');
    assert.equal(
      await remove.evaluate((el) => getComputedStyle(el).boxShadow),
      await resolveStyle(remove, 'var(--md-sys-elevation-level1)', 'box-shadow'),
    );
    await page.mouse.down();
    assert(await remove.evaluate((el) => el.matches(':active')));
    await checkActivePaint('pressed');
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await selected.focus();
    await page.keyboard.press('Tab');
    assert(await remove.evaluate((el) => el.matches(':focus-visible')));
    await checkActivePaint('focus');
    const checkRing = async (control: Locator, palette: Locator) => {
      const ring = await control.evaluate((el) => {
        const target = el.querySelector(':popover-open') ?? el;
        const style = getComputedStyle(target);
        return [style.outlineColor, style.outlineStyle, style.visibility];
      });
      assert.deepEqual(ring, [await role(palette, 'secondary'), 'solid', 'visible']);
    };
    await checkRing(remove, remove);
    await fileActions.screenshot({ path: `.tmp/local-colors/button-${scheme}.png` });
    await fileActions.evaluate((el) => el.style.removeProperty('--md-state-layer-color'));

    await selected.uncheck();
    assert(await remove.isDisabled());
    const disabled = await paint(remove);
    assert.equal(disabled.display, 'none');
    assert.equal(
      disabled.background,
      await resolveStyle(remove, 'rgb(from var(--md-sys-color-on-surface) r g b / 0.1)'),
    );
    assert.equal(disabled.label, await resolveStyle(remove, 'rgb(from var(--md-sys-color-on-surface) r g b / 0.38)'));
    await selected.check();
    assert.equal((await paint(button('Preview'))).label, primary);

    const local = await role(card, 'primary');
    assert.notEqual(local, primary);
    assert.equal(
      await card.evaluate((el) => getComputedStyle(el).backgroundColor),
      await role(card, 'surface-container-highest'),
    );
    const restore = button('Restore default');
    assert.equal((await paint(restore)).label, await role(card, 'on-surface-variant'));
    assert.equal(
      await restore.evaluate((el) => getComputedStyle(el).borderTopColor),
      await resolveStyle(card, 'color-mix(in srgb, var(--md-sys-color-on-surface-variant) 28.5%, transparent)'),
    );
    const box = card.locator('[data-part="control"]');
    assert.equal(await box.evaluate((el) => getComputedStyle(el, '::before').backgroundColor), local);
    assert.equal(
      await card.locator('[data-part="icon"]').evaluate((el) => getComputedStyle(el).borderLeftColor),
      await role(card, 'on-primary'),
    );
    const reminders = page.getByRole('checkbox', { name: 'Email reminders' });
    await reminders.uncheck();
    await page.mouse.move(0, 0);
    assert(
      (
        await box.evaluate(async (el) => {
          await Promise.allSettled(el.getAnimations({ subtree: true }).map((a) => a.finished));
          return getComputedStyle(el, '::before').boxShadow;
        })
      ).includes(await role(card, 'on-surface-variant')),
    );
    await restore.click();
    assert(await reminders.isChecked());

    const draft = page.locator('.draft');
    const trigger = button('Discard draft…');
    assert.equal(
      await draft.evaluate((el) => getComputedStyle(el).backgroundColor),
      await role(card, 'surface-container'),
    );
    assert.equal((await paint(trigger)).label, normal.background);
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Discard draft?' });
    const surface = dialog.locator('[data-part="surface"]');
    assert(await dialog.evaluate((el) => el.matches(':modal')));
    assert.equal(
      await surface.evaluate((el) => getComputedStyle(el).backgroundColor),
      await role(remove, scheme === 'dark' ? 'surface-container-highest' : 'surface-container-high'),
    );
    assert.equal(
      await surface.evaluate((el) => getComputedStyle(el).borderTopColor),
      await role(remove, 'outline-variant'),
    );
    assert.equal(
      await surface.evaluate((el) => getComputedStyle(el).boxShadow),
      await resolveStyle(remove, 'var(--md-overlay-modal-elevation)', 'box-shadow'),
    );
    assert.equal(
      await dialog.getByRole('heading').evaluate((el) => getComputedStyle(el).color),
      await role(remove, 'on-surface'),
    );
    assert.equal(
      await dialog.locator('[data-part="content"]').evaluate((el) => getComputedStyle(el).color),
      await role(remove, 'on-surface-variant'),
    );
    const keep = dialog.getByRole('button', { name: 'Keep editing' });
    const discard = dialog.getByRole('button', { name: 'Discard', exact: true });
    assert.equal((await paint(keep)).label, normal.background);
    await discard.hover();
    assert.equal((await paint(discard)).layer, normal.background);
    await page.mouse.move(0, 0);
    await keep.focus();
    await page.keyboard.press('Tab');
    assert(await discard.evaluate((el) => el.matches(':focus-visible')));
    await checkRing(discard, remove);
    assert.equal(
      await dialog.evaluate((el) => getComputedStyle(el, '::backdrop').backgroundColor),
      await resolveStyle(remove, 'rgb(from var(--md-sys-color-scrim) r g b / 0.3)'),
    );
    const focused = await paint(discard);
    assert.equal(focused.label, normal.background);
    assert.equal(focused.layer, normal.background);
    await surface.screenshot({ path: `.tmp/local-colors/dialog-${scheme}.png`, animations: 'disabled' });
    await discard.hover();
    await page.mouse.down();
    assert.equal((await paint(discard)).label, normal.background);
    await page.mouse.up();
    await surface.waitFor({ state: 'hidden' });
    assert.equal((await paint(button('Preview'))).label, primary);
    colorsByMode.push([normal.background, local]);
  }
  assert.notEqual(colorsByMode[0][0], colorsByMode[1][0]);
  assert.notEqual(colorsByMode[0][1], colorsByMode[1][1]);
  await openFixture(page, `${base}/zh-Hans/guides/styling`);
  const previews = page.locator('.demo-container');
  assert.equal(await previews.count(), 3);
  for (const preview of await previews.all()) {
    await preview.getByRole('button', { name: /显示源码/ }).click();
    await preview.locator('pre code').waitFor();
    assert((await preview.locator('pre code').innerText()).includes("from '@chillet/m3-vue'"));
  }
  assert.deepEqual(errors, []);
  console.log('Styling guide passed in light and dark modes, including Button states, Card controls and Teleport.');
} finally {
  await browser.close();
}
