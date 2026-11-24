import { argbFromHex, DynamicScheme, Hct, hexFromArgb, Variant } from '@chillet/material-color-utilities';
import defaultPalette from './palette.json';

/** Create reusable Vue bindings for a local Material color theme from a #RRGGBB seed. */
export function createColorTheme(sourceColor: string) {
  if (!/^#[\da-f]{6}$/i.test(sourceColor)) throw new TypeError('Expected a #RRGGBB theme color.');

  const sourceColorHct = Hct.fromInt(argbFromHex(sourceColor));
  const palettesForScheme = (isDark: boolean) => {
    const scheme = new DynamicScheme({
      sourceColorHct,
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
  };
  const light = palettesForScheme(false);
  const dark = palettesForScheme(true);
  const style: Record<string, string> = {};

  for (const family of Object.keys(defaultPalette) as (keyof typeof defaultPalette)[]) {
    for (const tone of Object.keys(defaultPalette[family])) {
      const lightColor = hexFromArgb(light[family].tone(Number(tone)));
      const darkColor = hexFromArgb(dark[family].tone(Number(tone)));
      style[`--md-ref-palette-${family}${tone}`] =
        lightColor === darkColor ? lightColor : `light-dark(${lightColor}, ${darkColor})`;
    }
  }
  return { class: 'm3-color-theme', style };
}
