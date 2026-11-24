// Run after pnpm build: exercise public package exports and preserved CSS side effects.
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { m3ColorThemes } from '@chillet/m3-vue/vite';
import { createColorTheme } from '@chillet/m3-vue/theme';
const outDir = await mkdtemp(resolve(tmpdir(), 'm3-preset-consumer-'));
const root = resolve('tests/browser/preset-package');
try {
  const bundle = await build({
    configFile: false,
    root,
    logLevel: 'error',
    plugins: [m3ColorThemes({ 'warning-theme': '#b3261e' })],
    build: { outDir, emptyOutDir: true },
  });
  assert('output' in bundle);
  for (const file of bundle.output) {
    if (file.type === 'chunk') {
      assert(
        !Object.keys(file.modules).some((id) => id.includes('/material-color-utilities/')),
        'Static themes ship CSS only',
      );
    }
  }
  const server = await preview({ configFile: false, root, build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable' });
  try {
    const page = await browser.newPage();
    await page.goto(server.resolvedUrls.local[0]);
    await page.locator('[data-scope="switch"][data-part="root"]').waitFor();
    const actual = await page.evaluate(() => ({
      density: getComputedStyle(document.documentElement).getPropertyValue('--md-density').trim(),
      font: getComputedStyle(document.querySelector('[data-scope="switch"][data-part="label"]')!).fontSize,
      switchSize: document.querySelector('[data-scope="switch"][data-part="root"]')!.getAttribute('data-size'),
      buttonSize: document.querySelector('[data-scope="icon-button"][data-part="root"]')!.getAttribute('data-size'),
      fieldSize: document.querySelector('[data-scope="text-field"][data-part="root"]')!.getAttribute('data-size'),
    }));
    assert.deepEqual(actual, {
      density: '-2',
      font: '12px',
      switchSize: 'small',
      buttonSize: 'extra-small',
      fieldSize: 'small',
    });
    assert.equal(await page.getByRole('textbox', { name: 'Name' }).count(), 1);
    const button = page.getByRole('button', { name: 'Delete' });
    assert.equal(await button.getAttribute('style'), null);
    const dynamic = createColorTheme('#b3261e');
    // Compare actual paint against the runtime binding for the same seed and preset.
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      const colors = await button.evaluate(async (el, dynamic) => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--md-sys-color-primary)';
        document.body.append(probe);
        const outer = getComputedStyle(probe).color;
        el.append(probe);
        const local = getComputedStyle(probe).color;
        const runtime = document.createElement('span');
        runtime.className = dynamic.class;
        for (const [name, value] of Object.entries(dynamic.style)) runtime.style.setProperty(name, value);
        document.body.append(runtime);
        runtime.append(probe);
        const runtimeColor = getComputedStyle(probe).color;
        runtime.remove();
        await Promise.allSettled(el.getAnimations().map((animation) => animation.finished));
        return { outer, local, runtimeColor, fill: getComputedStyle(el).backgroundColor };
      }, dynamic);
      assert.notEqual(colors.local, colors.outer);
      assert.equal(colors.fill, colors.local);
      assert.equal(colors.fill, colors.runtimeColor);
    }
    assert.equal(await page.locator('[data-scope="text-field"] label, [data-scope="text-field"] legend').count(), 0);
    console.log('Published compact preset and static theme class passed, including light/dark runtime theme parity.');
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
  }
} finally {
  await rm(outDir, { recursive: true, force: true });
}
