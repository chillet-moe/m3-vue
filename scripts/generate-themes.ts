import { mkdir, writeFile } from 'node:fs/promises';
import { cssRule, libraryColorRules } from '../src/theme/color-rules';
import roleInputs from '../src/theme/color-roles.json';
import palette from '../src/theme/palette.json';
import tokens from '../src/theme/tokens.json';
import { themePresets, typographyPresets } from '../src/theme/presets';

const referenceColors = Object.entries(palette).flatMap(([family, tones]) =>
  Object.entries(tones).map(([tone, color]) => `    --md-ref-palette-${family}${tone}: ${color};`),
);

await mkdir('src/styles/themes', { recursive: true });
await writeFile('src/styles/color-roles.css', `@layer tokens {\n${libraryColorRules.join('\n\n')}\n}\n`);
for (const [name, preset] of Object.entries(themePresets)) {
  const values = { ...tokens, ...typographyPresets[preset.typography], '--md-density': String(preset.density) };
  const root = [...referenceColors, ...Object.entries(values).map(([name, value]) => `    ${name}: ${value};`)];
  const css = `@layer tokens {
  :root {
${root.join('\n')}
  }

${cssRule(':root,\n  :where(.m3-color-theme)', roleInputs)}
}
`;
  await writeFile(`src/styles/themes/${name}.css`, css);
}
