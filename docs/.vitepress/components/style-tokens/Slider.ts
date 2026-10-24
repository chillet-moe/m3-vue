import type { StyleTokenMeta } from './types';

export const sliderStyleTokens = [
  {
    name: '--md-slider-track-thickness',
    description: 'Standard track thickness.',
    fallback: '0.25rem',
    category: 'Size',
  },
  {
    name: '--md-slider-thumb-size',
    description: 'Standard thumb diameter; size determines the fallback.',
    fallback: '1rem',
    category: 'Size',
  },
  {
    name: '--md-slider-target-size',
    description: 'Standard hit area, independent of thumb size.',
    fallback: '2rem',
    category: 'Size',
  },
  {
    name: '--md-slider-active-track-color',
    description: 'Controls active track color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'Color',
  },
  {
    name: '--md-slider-inactive-track-color',
    description: 'Controls inactive track color.',
    fallback: 'var(--md-sys-color-primary-container)',
    category: 'Color',
  },
  {
    name: '--md-slider-handle-color',
    description: 'Controls handle color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'Color',
  },
  {
    name: '--md-slider-active-icon-color',
    description: 'Controls icon color on the active track.',
    fallback: 'var(--md-sys-color-on-primary)',
    category: 'Color',
  },
  {
    name: '--md-slider-inactive-icon-color',
    description: 'Controls icon color on the inactive track.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'Color',
  },
  {
    name: '--md-slider-value-indicator-background',
    description: 'Controls value indicator container color.',
    fallback: 'var(--md-sys-color-inverse-surface)',
    category: 'Color',
  },
  {
    name: '--md-slider-value-indicator-color',
    description: 'Controls value indicator label color.',
    fallback: 'var(--md-sys-color-inverse-on-surface)',
    category: 'Color',
  },
] satisfies StyleTokenMeta[];
