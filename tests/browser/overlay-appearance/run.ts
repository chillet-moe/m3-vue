import { openFixture } from '../fonts';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
const browser = await chromium.launch({ ...(existsSync(chrome) ? { executablePath: chrome } : {}), headless: true });
const output = '.tmp/overlay-appearance';
mkdirSync(output, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 }, reducedMotion: 'reduce' });
  await page.addInitScript('window.__name = (fn) => fn');
  const geometry = new Map<string, string>();
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const background of ['surface', 'surface-container-highest']) {
      await openFixture(page, new URL('/tests/browser/overlay-appearance/', server.resolvedUrls!.local[0]).href);
      await page.getByRole('button', { name: 'Menu', exact: true }).waitFor();
      await page.evaluate(
        ({ scheme, background }) => {
          document.documentElement.style.colorScheme = scheme;
          document.body.style.background = `var(--md-sys-color-${background})`;
          document.body.style.color = 'var(--md-sys-color-on-surface)';
          document.body.style.minHeight = '100vh';
        },
        { scheme, background },
      );
      const capture = async (name: string, selector: string) => {
        await page.locator(selector).first().waitFor({ state: 'visible' });
        const values = await page
          .locator(selector)
          .first()
          .evaluate((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return {
              border: style.borderTopWidth,
              borderStyle: style.borderTopStyle,
              radius: style.borderRadius,
              shadow: style.boxShadow,
              background: style.backgroundColor,
              color: style.color,
              inViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
            };
          });
        assert.equal(values.border, '1px');
        assert.equal(values.borderStyle, 'solid');
        assert(values.inViewport, `${name} outside viewport`);
        assert.notEqual(values.background, 'rgba(0, 0, 0, 0)');
        assert.equal((values.shadow.match(/rgba?\(/g) ?? []).length, 2, `${name}: two shadows`);
        const shape = values.radius + values.shadow.replace(/rgba?\([^)]+\)/g, 'color');
        if (geometry.has(name)) assert.equal(shape, geometry.get(name), `${name}: identical theme geometry`);
        else geometry.set(name, shape);
        await page.screenshot({ path: `${output}/${scheme}-${background}-${name}.png` });
      };
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await page.getByText('Open', { exact: true }).hover();
      await capture('menu-hover', '.m3-menu-container');
      await page.getByRole('menuitem', { name: 'Move to' }).focus();
      await page.keyboard.press('ArrowRight');
      await page.getByText('Personal', { exact: true }).waitFor({ state: 'visible' });
      await capture('nested-menu', '.m3-menu[data-submenu="true"] .m3-menu-container');
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      for (const label of ['Workspace', 'Find workspace']) {
        await page.getByRole('combobox', { name: label, exact: true }).click();
        await page.keyboard.press('ArrowDown');
        await capture(
          label === 'Workspace' ? 'select-focus' : 'combobox-focus',
          '.m3-select-menu:popover-open [data-part="container"]',
        );
        const scroll = await page
          .locator('.m3-select-menu:popover-open [data-part="container"]')
          .evaluate((element) => {
            element.scrollTop = element.scrollHeight;
            return { scrollTop: element.scrollTop, overflow: element.scrollHeight > element.clientHeight };
          });
        assert(scroll.overflow && scroll.scrollTop > 0, `${label} scrolls`);
        await capture(
          label === 'Workspace' ? 'select-scroll' : 'combobox-scroll',
          '.m3-select-menu:popover-open [data-part="container"]',
        );
        await page.keyboard.press('Escape');
      }
      await page.getByRole('button', { name: 'Popover', exact: true }).click();
      await page.keyboard.press('Tab');
      await capture('popover', '.m3-popover:popover-open [data-part="surface"]');
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Dialog', exact: true }).click();
      await capture('dialog', '.m3-dialog [data-part="surface"]');
      await page.getByRole('combobox', { name: 'Active workspace', exact: true }).click();
      await capture('dialog-select', '.m3-select-menu:popover-open [data-part="container"]');
      await page.keyboard.press('Escape');
      await page.locator('[data-scope="dialog"][data-part="content"]').evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      await page.getByRole('button', { name: 'Save', exact: true }).focus();
      await capture('dialog-scroll', '.m3-dialog [data-part="surface"]');
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.getByRole('button', { name: 'Native dialog', exact: true }).click();
      await capture('native-dialog', 'dialog.native-overlay');
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      // Position the real trigger at the viewport corner to exercise anchor fallback and clipping.
      await page.getByRole('button', { name: 'Menu', exact: true }).evaluate((element) => {
        element.style.cssText = 'position:fixed;right:4px;bottom:4px';
      });
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await capture('menu-edge', '.m3-menu-container');
      await page.getByRole('menuitem', { name: 'Move to' }).focus();
      await page.keyboard.press('ArrowRight');
      await capture('nested-edge', '.m3-menu[data-submenu="true"] .m3-menu-container');
      // A border remains independent when a consumer replaces the entire shadow.
      const borderOverride = await page
        .locator('.m3-menu-container')
        .first()
        .evaluate((element) => {
          document.documentElement.style.setProperty('--md-overlay-elevation', 'none');
          document.documentElement.style.setProperty('--md-overlay-border-color', 'rgb(1 2 3)');
          const shared = getComputedStyle(element);
          const result = { border: shared.borderTopColor, shadow: shared.boxShadow };
          element.closest<HTMLElement>('.m3-menu')!.style.setProperty('--md-menu-container-border-color', 'rgb(4 5 6)');
          return { ...result, localBorder: getComputedStyle(element).borderTopColor };
        });
      assert.deepEqual(borderOverride, { border: 'rgb(1, 2, 3)', shadow: 'none', localBorder: 'rgb(4, 5, 6)' });
    }
  }
  const comparison = await browser.newPage({ viewport: { width: 1500, height: 880 } });
  for (const background of ['surface', 'surface-container-highest']) {
    const panels = ['nested-menu', 'select-focus', 'dialog-scroll'];
    const cells = ['light', 'dark'].flatMap((scheme) =>
      panels.map((panel) => {
        const png = readFileSync(`${output}/${scheme}-${background}-${panel}.png`).toString('base64');
        return `<section><h2>${scheme} · ${panel}</h2><img src="data:image/png;base64,${png}"></section>`;
      }),
    );
    await comparison.setContent(
      `<html><style>body{margin:0;background:#777;font:16px system-ui}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px}h2{font-size:16px;margin:0;padding:8px;background:#eee}img{display:block;width:100%}</style><div class="grid">${cells.join('')}</div></html>`,
    );
    await comparison.screenshot({ path: `${output}/comparison-${background}.png`, fullPage: true });
  }
  console.log(`Overlay appearance verified in both schemes on two backgrounds. Screenshots: ${output}`);
} finally {
  await browser.close();
  await server.close();
}
