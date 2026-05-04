import type { StyleTokenMeta } from './types';

export const timePickerStyleTokens = [
  {
    name: '--md-time-picker-container-color',
    description: 'Controls container color.',
    fallback: 'var(--md-sys-color-surface-container-high)',
    category: 'Color',
  },
  {
    name: '--md-time-picker-container-elevation',
    description: 'Controls container elevation.',
    fallback: 'var(--md-sys-elevation-level3)',
    category: 'Elevation',
  },
  {
    name: '--md-time-picker-container-shape',
    description: 'Controls container shape.',
    fallback: 'var(--md-sys-shape-corner-extra-large)',
    category: 'Shape',
  },
  {
    name: '--md-time-picker-container-width',
    description: 'Controls container width.',
    fallback: '22.5rem',
    category: 'Layout',
  },
  {
    name: '--md-time-picker-clock-dial-container-color',
    description: 'Controls clock dial container color.',
    fallback: 'var(--md-sys-color-surface-container-highest)',
    category: 'Color',
  },
  {
    name: '--md-time-picker-clock-hand-color',
    description: 'Controls clock hand and selected clock option color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'Color',
  },
  {
    name: '--md-time-picker-clock-label-text-color',
    description: 'Controls unselected clock option label color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Color',
  },
  {
    name: '--md-time-picker-clock-selected-label-text-color',
    description: 'Controls selected clock option label color.',
    fallback: 'var(--md-sys-color-on-primary)',
    category: 'State',
  },
  {
    name: '--md-time-picker-selector-container-color',
    description: 'Controls time selector field container color.',
    fallback: 'var(--md-sys-color-surface-container-highest)',
    category: 'Color',
  },
  {
    name: '--md-time-picker-selector-selected-container-color',
    description: 'Controls selected time selector field container color.',
    fallback: 'var(--md-sys-color-primary-container)',
    category: 'State',
  },
  {
    name: '--md-time-picker-selector-selected-label-text-color',
    description: 'Controls selected time selector field label color.',
    fallback: 'var(--md-sys-color-on-primary-container)',
    category: 'State',
  },
  {
    name: '--md-time-picker-selector-unselected-label-text-color',
    description: 'Controls unselected time selector field label color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Color',
  },
  {
    name: '--md-time-picker-period-selector-outline-color',
    description: 'Controls AM/PM selector outline color.',
    fallback: 'var(--md-sys-color-outline)',
    category: 'Color',
  },
  {
    name: '--md-time-picker-title-text-color',
    description: 'Controls title text color.',
    fallback: 'var(--md-sys-color-on-surface-variant)',
    category: 'Color',
  },
] satisfies StyleTokenMeta[];
