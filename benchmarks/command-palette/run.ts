// pnpm exec tsx benchmarks/command-palette/run.ts
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { createScopeBoundaryVueOptions } from '@chillet/vue-scope-boundary/vite';
import { chromium, type Browser } from 'playwright';
import { build, preview, type InlineConfig } from 'vite';
import { openFixture } from '../../tests/browser/fonts';

const root = resolve(import.meta.dirname, '../..');
const fixture = 'tests/browser/command-palette/index.html';
const config: InlineConfig = {
  configFile: false,
  root,
  logLevel: 'error',
  plugins: [vue(createScopeBoundaryVueOptions())],
  resolve: { alias: { '@': resolve(root, 'src') } },
  build: {
    outDir: resolve(root, '.tmp/command-palette-benchmark'),
    rolldownOptions: { input: resolve(root, fixture) },
  },
};
await build(config);
const server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0 } });
let browser: Browser | undefined;
try {
  const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable';
  browser = await chromium.launch({ executablePath: existsSync(chrome) ? chrome : undefined });
  for (const mode of ['plain', 'virtual']) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
    await page.addInitScript('window.__name = (fn) => fn');
    await openFixture(page, new URL(fixture + '?' + mode, server.resolvedUrls!.local[0]).href);
    const samples = await page.evaluate(async () => {
      const count = 3000;
      window.setCommands(
        Array.from({ length: count }, (_, i) => ({
          id: 'command-' + i,
          name: 'Editor action ' + i,
          group: 'Editor',
          shortcut: 'Ctrl+K',
          icon: 'edit',
          keywords: [i === 0 ? 'target' : 'common', 'action'],
        })),
      );
      const input = document.querySelector<HTMLInputElement>('[role=combobox]')!;
      const list = document.querySelector<HTMLElement>('[role=listbox]')!;
      const trigger = document.querySelector('button')!;
      const query = (value: string) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      // Include asynchronous window measurement. Stop only once real rows cover the viewport
      // and the focused combobox exposes the first option of the expected logical result set.
      async function timeUntilReady(action: () => void, size: number) {
        await frame();
        const start = performance.now();
        action();
        await Promise.resolve();
        for (let i = 0; i < 120; i++) {
          const active = document.getElementById(input.getAttribute('aria-activedescendant') ?? '');
          if (active && document.activeElement === input && active.getAttribute('aria-setsize') === String(size)) {
            const viewport = list.getBoundingClientRect();
            const bottom = Math.min(
              viewport.bottom - parseFloat(getComputedStyle(list).paddingBottom) - 1,
              innerHeight - 1,
            );
            const hit = document.elementFromPoint(viewport.left + viewport.width / 2, bottom)?.closest('[role=option]');
            if (hit && list.contains(hit)) return performance.now() - start;
          }
          await frame();
        }
        throw new Error('Results did not fill the viewport');
      }
      const samples = [];
      for (let run = 0; run < 8; run++) {
        const open = await timeUntilReady(() => trigger.click(), count);
        await timeUntilReady(() => query('target'), 1);
        const clear = await timeUntilReady(() => query(''), count);
        const mounted = list.querySelectorAll('[role=option]').length;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await frame();
        if (run) samples.push({ open, clear, mounted });
      }
      return samples;
    });
    const median = (key: 'open' | 'clear' | 'mounted') =>
      samples.map((row) => row[key]).sort((a, b) => a - b)[Math.floor(samples.length / 2)]!;
    assert(mode === 'plain' ? median('mounted') === 3000 : median('mounted') < 50);
    console.log(mode, { openMs: median('open'), clearMs: median('clear'), mounted: median('mounted') });
    await page.close();
  }
} finally {
  await browser?.close();
  await server.close();
}
