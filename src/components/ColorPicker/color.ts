/** Unpremultiplied, encoded sRGB. All four channels are numbers in [0, 1]. */
export type ColorPickerValue = { r: number; g: number; b: number; a: number };
export const pickerLayouts = {
  'sv-h': { wheel: false, model: 'HSV', x: 's', y: 'level', bar: 'h' },
  'hs-v': { wheel: false, model: 'HSV', x: 'h', y: 's', bar: 'level' },
  'hv-s': { wheel: false, model: 'HSV', x: 'h', y: 'level', bar: 's' },
  'hsv-wheel': { wheel: true, model: 'HSV', x: 'h', y: 's', bar: 'level' },
  'hsl-wheel': { wheel: true, model: 'HSL', x: 'h', y: 's', bar: 'level' },
} as const;
export type ColorPickerLayout = keyof typeof pickerLayouts;

export type Rgb = Omit<ColorPickerValue, 'a'>;
export type Polar = { h: number; s: number; level: number };
export type PolarModel = 'HSV' | 'HSL';
export type ColorPickerSpace = 'srgb' | 'linear';
export const unit = (n: number) => Math.min(1, Math.max(0, n));

export const decode = (n: number) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
export const encode = (n: number) => (n === 1 ? 1 : n <= 0.0031308 ? 12.92 * n : n ** (1 / 2.4) * 1.055 - 0.055);

export type HueMemory = { h: number; hsvS: number; hslS: number };

export function coordinates({ r, g, b }: Rgb, memory: HueMemory) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = memory.h;
  if (delta) {
    let sector: number;
    if (r === max) sector = (g - b) / delta;
    else if (g === max) sector = (b - r) / delta + 2;
    else sector = (r - g) / delta + 4;
    h = (sector < 0 ? sector + 6 : sector) * 60;
    if (h === 0 && memory.h === 360) h = 360;
  }
  const lightness = (max + min) / 2;
  const hslRange = lightness <= 0.5 ? max + min : 1 - max + (1 - min);
  return {
    HSV: { h, s: max === 0 ? memory.hsvS : delta / max, level: max },
    HSL: { h, s: hslRange === 0 ? memory.hslS : delta / hslRange, level: lightness },
  };
}

export function toRgb({ h, s, level }: Polar, model: PolarModel): Rgb {
  const chroma = model === 'HSV' ? level * s : 2 * Math.min(level, 1 - level) * s;
  const max = model === 'HSV' ? level : level + chroma / 2;
  const sector = (h / 60) % 6;
  const channel = (offset: number) => {
    const k = (sector + offset) % 6;
    return unit(max - chroma * unit(Math.min(k, 4 - k)));
  };
  return { r: channel(5), g: channel(3), b: channel(1) };
}

export function parseHex(text: string) {
  const match = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(text.trim());
  if (!match) return;
  const digits = match[1].length < 5 ? Array.from(match[1], (n) => n + n).join('') : match[1];
  const channel = (i: number) => parseInt(digits.slice(i, i + 2), 16) / 255;
  return { r: channel(0), g: channel(2), b: channel(4), a: digits.length === 8 ? channel(6) : undefined };
}

export function formatHex({ r, g, b, a }: ColorPickerValue, alpha: boolean) {
  const channels = alpha ? [r, g, b, a] : [r, g, b];
  return (
    '#' +
    channels
      .map((n) =>
        Math.round(n * 255)
          .toString(16)
          .padStart(2, '0')
          .toUpperCase(),
      )
      .join('')
  );
}

export const cssRgb = ({ r, g, b }: Rgb, a = 1) => `color(srgb ${r} ${g} ${b} / ${a})`;
