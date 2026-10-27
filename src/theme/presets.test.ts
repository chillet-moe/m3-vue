import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { themePresets, typographyPresets } from './presets';

it('ships standalone themes with the same presets as the documentation controls', () => {
  for (const [name, preset] of Object.entries(themePresets)) {
    const css = readFileSync(`src/styles/themes/${name}.css`, 'utf8');
    expect(css).not.toContain('@import');
    const entries = [...css.matchAll(/(--md-[\w-]+):\s*([^;]+);/g)];
    const values = Object.fromEntries(entries.map((match) => [match[1], match[2]]));
    expect(Object.keys(values)).toHaveLength(entries.length);
    expect(values).toMatchObject(typographyPresets[preset.typography]);
    expect(values['--md-density']).toBe(String(preset.density));
  }
});
