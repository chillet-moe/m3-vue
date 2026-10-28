// Build-time helpers shared by the library, browser fixtures, and documentation site.
const densityHeight = (base, content, reference, padding = '2') =>
  `calc(${content} + max(${(Number(padding) * 2) / 16}rem, calc(${(Number(base) - Number(reference)) / 16}rem + var(--md-density, 0) * 0.25rem)))`;

export const cssFunctions = {
  // Android dp to rem conversion (1dp = 1/16rem).
  '--dp': (value) => `${parseFloat(value) / 16}rem`,
  // Content plus adjustable whitespace. Floors reserve space, never shrink content.
  '--density-space': (base, minimum = '0', step = '4') =>
    `max(${Number(minimum) / 16}rem, calc(${Number(base) / 16}rem + var(--md-density, 0) * ${Number(step) / 16}rem))`,
  '--density-height': densityHeight,
  // Icon content changes more slowly than control whitespace; explicit sizes bypass this helper.
  '--density-icon': (base) =>
    `calc(clamp(${Math.max(16, Number(base) - 4) / 16}rem, calc(${Number(base) / 16}rem + var(--md-density, 0) * 0.0625rem), ${(Number(base) + 4) / 16}rem) * clamp(0.5, var(--md-icon-scale, 1), 2))`,
  // Buttons and connected groups share typography and geometry for each size.
  '--action-height': (base) => {
    const [role, content] = {
      32: ['label-large', 20],
      40: ['label-large', 20],
      56: ['title-medium', 24],
      96: ['headline-small', 32],
      136: ['headline-large', 40],
    }[base];
    return densityHeight(
      base,
      `max(var(--md-sys-typescale-${role}-line-height), var(--_button-icon-size, --density-icon(${content})))`,
      content,
    );
  },
  // Preserve the input color channels and replace its opacity.
  '--translucent': (color, opacity) => `rgba(from ${color} r g b / ${opacity})`,
};
