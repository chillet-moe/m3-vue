import { argbFromHex, DynamicScheme, Hct, hexFromArgb, Variant } from '@chillet/material-color-utilities';
import themeTokens from '@/theme/tokens.json';

export const defaultSourceColor = '#655789';
export const isSourceColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);

/** Override the reference palette while preserving the library's system color roles. */
export function colorTokens(sourceColor: string): Record<string, string> {
  const palettes = [false, true].map((isDark) => {
    const scheme = new DynamicScheme({
      sourceColorHct: Hct.fromInt(argbFromHex(sourceColor)),
      variant: Variant.TONAL_SPOT,
      contrastLevel: 0,
      isDark,
      specVersion: '2025',
    });
    return {
      primary: scheme.primaryPalette,
      secondary: scheme.secondaryPalette,
      tertiary: scheme.tertiaryPalette,
      neutral: scheme.neutralPalette,
      'neutral-variant': scheme.neutralVariantPalette,
      error: scheme.errorPalette,
    };
  });
  const result: Record<string, string> = {};
  // The shipped theme owns the palette names and tones required by its color roles.
  for (const name of Object.keys(themeTokens)) {
    const match = /^--md-ref-palette-([a-z-]+)(\d+)$/.exec(name);
    if (!match) continue;
    const palette = match[1] as keyof (typeof palettes)[number];
    const tone = Number(match[2]);
    const light = hexFromArgb(palettes[0]![palette].tone(tone));
    const dark = hexFromArgb(palettes[1]![palette].tone(tone));
    result[name] = light === dark ? light : `light-dark(${light}, ${dark})`;
  }
  return result;
}
