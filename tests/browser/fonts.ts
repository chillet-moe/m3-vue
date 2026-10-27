import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Frame, Page } from 'playwright';

const require = createRequire(import.meta.url);
const font = readFileSync(require.resolve('material-symbols/material-symbols-outlined.woff2')).toString('base64');
const fontCss = `@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 100 700;
  src: url(data:font/woff2;base64,${font}) format('woff2');
}`;

/** Local, pinned icons for screenshots and geometry checks, including child Documents. */
export async function loadTestFonts(target: Page | Frame): Promise<void> {
  await target.addStyleTag({ content: fontCss });
  const loaded = await target.evaluate(async () => {
    const faces = await document.fonts.load('24px "Material Symbols Outlined"', 'check');
    await document.fonts.ready;
    // fonts.check alone also succeeds when a missing family falls back to another font.
    return faces.length > 0 && faces.every((face) => face.status === 'loaded');
  });
  assert(loaded, 'The pinned Material Symbols test font must load before browser assertions or screenshots.');
}

/** Navigate a browser fixture only after its local icon font is ready. */
export async function openFixture(page: Page, url: string, options?: Parameters<Page['goto']>[1]): Promise<void> {
  await page.goto(url, options);
  await loadTestFonts(page);
}
