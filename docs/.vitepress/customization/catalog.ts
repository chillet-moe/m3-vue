import { typographyPresets } from '@/theme/presets';
import { shapeRoles } from './shapes';

export const fieldGapSettings = [
  { key: 'fieldRowGap', token: '--md-field-row-gap' },
  { key: 'fieldColumnGap', token: '--md-field-column-gap' },
] as const;
export const tokenNames = new Set([
  ...Object.keys(typographyPresets.default),
  ...shapeRoles.map((role) => role.token),
  ...fieldGapSettings.map((setting) => setting.token),
]);
export const typeRoles = ['display', 'headline', 'title', 'body', 'label'].flatMap((role) =>
  ['large', 'medium', 'small'].map((size) => `${role}-${size}`),
);
export const typeProperties = ['size', 'line-height', 'weight', 'tracking', 'font'] as const;
export const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'];
const choices = (...values: string[]) => values;
export const defaultSettings = [
  { key: 'rowSize', options: sizes },
  { key: 'appearance', options: choices('standard', 'expressive') },
  { key: 'shape', options: choices('rounded', 'square') },
  { key: 'fieldSize', options: choices('extra-small', 'small', 'medium') },
  { key: 'buttonSize', options: sizes },
  { key: 'iconButtonSize', options: sizes },
  { key: 'listSize', options: sizes },
  { key: 'listAppearance', options: choices('standard', 'expressive') },
  { key: 'sliderSize', options: sizes },
  { key: 'sliderAppearance', options: choices('standard', 'expressive') },
  { key: 'menuColor', options: choices('standard', 'vibrant') },
  { key: 'firstDayOfWeek', options: choices('0', '1', '2', '3', '4', '5', '6') },
  { key: 'timeFormat', options: choices('12h', '24h') },
  { key: 'timeInputMode', options: choices('clock', 'keyboard') },
  { key: 'pressShapeMorph', options: choices('true', 'false') },
  { key: 'sliderWheel', options: choices('true', 'false') },
  { key: 'valueIndicator', options: choices('true', 'false') },
] as const;
