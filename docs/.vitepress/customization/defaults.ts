import type { M3VuePluginOptions } from '@/plugin';
import { themePresets, type Preset } from '@/theme/presets';
import type { defaultSettings } from './catalog';

// The panel's flat controls map to the public plugin options here.
export const optionPaths = {
  rowSize: ['rowSize'],
  appearance: ['appearance'],
  shape: ['shape'],
  fieldSize: ['fieldSize'],
  fieldLabelBehavior: ['fieldLabelBehavior'],
  buttonSize: ['buttonDefaults', 'size'],
  iconButtonSize: ['iconButtonSize'],
  switchSize: ['switchSize'],
  listSize: ['listItemDefaults', 'size'],
  listAppearance: ['listItemDefaults', 'appearance'],
  sliderSize: ['sliderDefaults', 'size'],
  sliderAppearance: ['sliderDefaults', 'appearance'],
  menuColor: ['menuColor'],
  firstDayOfWeek: ['datePickerDefaults', 'firstDayOfWeek'],
  timeFormat: ['timePickerDefaults', 'format'],
  timeInputMode: ['timePickerDefaults', 'inputMode'],
  pressShapeMorph: ['buttonDefaults', 'pressShapeMorph'],
  sliderWheel: ['sliderDefaults', 'wheel'],
  valueIndicator: ['sliderDefaults', 'valueIndicator'],
} satisfies Record<(typeof defaultSettings)[number]['key'], [keyof M3VuePluginOptions, string?]>;

export function presetDefaultValues(preset: Preset): Record<string, string> {
  const defaults = themePresets[preset].defaults as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const [key, [group, property]] of Object.entries(optionPaths)) {
    const value = property ? (defaults[group] as Record<string, unknown> | undefined)?.[property] : defaults[group];
    if (value !== undefined) result[key] = String(value);
  }
  return result;
}
