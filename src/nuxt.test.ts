import { expect, it, vi } from 'vitest';
import type { M3VueNuxtOptions } from './nuxt';
const kit = vi.hoisted(() => ({ addComponent: vi.fn(), addImports: vi.fn(), addPluginTemplate: vi.fn() }));
vi.mock('@nuxt/kit', () => ({ ...kit, defineNuxtModule: (definition: unknown) => definition }));
import nuxtModule from './nuxt';
import { presets } from './presets/definitions';

it('keeps the compact preset when Nuxt directive registration is disabled', () => {
  const css: string[] = [];
  (nuxtModule as unknown as { setup(options: M3VueNuxtOptions, nuxt: { options: { css: string[] } }): void }).setup(
    { theme: 'compact', css: true, directives: false },
    { options: { css } },
  );
  expect(css).toEqual(['@chillet/m3-vue/style.css', '@chillet/m3-vue/themes/compact.css']);
  const source = kit.addPluginTemplate.mock.calls[0]![0].getContents() as string;
  const use = vi.fn();
  // Execute the generated plugin body to verify the values actually passed to Vue.
  const factory = new Function(
    'defineNuxtPlugin',
    'M3VuePlugin',
    source.replace(/^import .+;$/gm, '').replace('export default ', 'return '),
  );
  const plugin = {};
  factory((value: unknown) => value, plugin).setup({ vueApp: { use } });
  expect(use).toHaveBeenCalledWith(plugin, { directives: false, preset: presets.compact });
});
