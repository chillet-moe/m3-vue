import type { StyleTokenMeta } from './types';

export const radioStyleTokens = [
  {
    name: '--md-radio-disabled-dot-opacity',
    description: 'Controls disabled dot opacity.',
    fallback: '0.38',
    category: 'Disabled',
  },
  {
    name: '--md-radio-disabled-outline-opacity',
    description: 'Controls disabled outline opacity.',
    fallback: '0.38',
    category: 'Disabled',
  },
  {
    name: '--md-radio-disabled-selected-dot-color',
    description: 'Controls disabled selected dot color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Disabled',
  },
  {
    name: '--md-radio-disabled-selected-outline-color',
    description: 'Controls disabled selected outline color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Disabled',
  },
  {
    name: '--md-radio-disabled-unselected-outline-color',
    description: 'Controls disabled unselected outline color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Disabled',
  },
  {
    name: '--md-radio-focus-indicator-color',
    description: 'Controls focus indicator color.',
    fallback: 'var(--md-sys-color-secondary)',
    category: 'Focus',
  },
  {
    name: '--md-radio-focus-indicator-offset',
    description: 'Controls focus indicator offset.',
    fallback: 'var(--md-sys-state-focus-indicator-outer-offset)',
    category: 'Focus',
  },
  {
    name: '--md-radio-focus-indicator-thickness',
    description: 'Controls focus indicator thickness.',
    fallback: 'var(--md-sys-state-focus-indicator-thickness)',
    category: 'Focus',
  },
  {
    name: '--md-radio-icon-shape',
    description: 'Controls icon shape.',
    fallback: 'var(--md-sys-shape-corner-full)',
    category: 'Shape',
  },
  {
    name: '--md-radio-icon-size',
    description: 'Controls icon size.',
    fallback: 'Typography and density (20dp at default typography and density 0)',
    category: 'Layout',
  },
  {
    name: '--md-radio-selected-dot-color',
    description: 'Controls selected dot color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'State',
  },
  {
    name: '--md-radio-selected-dot-size',
    description: 'Controls selected dot size.',
    fallback: 'Resolved circle size / 2',
    category: 'State',
  },
  {
    name: '--md-radio-selected-outline-color',
    description: 'Controls selected outline color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'State',
  },
  {
    name: '--md-radio-selected-outline-width',
    description: 'Controls selected outline width.',
    fallback: 'Resolved circle size / 10',
    category: 'State',
  },
  {
    name: '--md-radio-target-size',
    description: 'Controls target size.',
    fallback: '40dp + 2dp per density step; at least circle size + 8dp; presentation uses circle size',
    category: 'Layout',
  },
  {
    name: '--md-radio-unselected-outline-color',
    description: 'Controls unselected outline color.',
    fallback: 'var(--md-sys-color-on-surface-variant)',
    category: 'State',
  },
  {
    name: '--md-radio-unselected-outline-width',
    description: 'Controls unselected outline width.',
    fallback: 'Resolved circle size / 10',
    category: 'State',
  },
] satisfies StyleTokenMeta[];
