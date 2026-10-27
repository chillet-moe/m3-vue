import { mkdir, writeFile } from 'node:fs/promises';
import tokens from '../src/theme/tokens.json';
import { themePresets, typographyPresets } from '../src/theme/presets';

await mkdir('src/styles/themes', { recursive: true });
for (const [name, preset] of Object.entries(themePresets)) {
  const values = { ...tokens, ...typographyPresets[preset.typography], '--md-density': String(preset.density) };
  const declarations = Object.entries(values).map(([token, value]) => `    ${token}: ${value};`);
  await writeFile(`src/styles/themes/${name}.css`, `@layer tokens {\n  :root {\n${declarations.join('\n')}\n  }\n}\n`);
}
