import tokens from './tokens.json';
import compactTypography from './compact.json';

export type Preset = 'default' | 'compact';
const defaultTypography = Object.fromEntries(
  Object.entries(tokens).filter(
    ([name]) => name.startsWith('--md-sys-typescale-') || name.startsWith('--md-ref-typeface-'),
  ),
);
export const typographyPresets: Record<Preset, Record<string, string>> = {
  default: defaultTypography,
  compact: { ...defaultTypography, ...compactTypography },
};
export const themePresets = {
  default: { typography: 'default', density: 0 },
  compact: { typography: 'compact', density: -2 },
} as const;
