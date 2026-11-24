import { mkdir, writeFile } from 'node:fs/promises';
import palette from '../src/theme/palette.json';
import tokens from '../src/theme/tokens.json';
import { themePresets, typographyPresets } from '../src/theme/presets';

const referenceColors = Object.entries(palette).flatMap(([family, tones]) =>
  Object.entries(tones).map(([tone, color]) => `    --md-ref-palette-${family}${tone}: ${color};`),
);

await mkdir('src/styles/themes', { recursive: true });
for (const [name, preset] of Object.entries(themePresets)) {
  const values = { ...tokens, ...typographyPresets[preset.typography], '--md-density': String(preset.density) };
  const root = [...referenceColors];
  const colorRoles: string[] = [];
  for (const [token, value] of Object.entries(values)) {
    // Resolve palette references wherever a new palette begins. Other preset defaults stay on the root.
    const declarations = token.startsWith('--md-sys-color-') ? colorRoles : root;
    declarations.push(`    ${token}: ${value};`);
  }
  const css = `@layer tokens {
  :root {
${root.join('\n')}
  }

  :root,
  :where(.m3-color-theme) {
${colorRoles.join('\n')}
  }
}
`;
  await writeFile(`src/styles/themes/${name}.css`, css);
}
