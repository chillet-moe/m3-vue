import type { StyleTokenMeta } from './types';

export const sliderStyleTokens = [
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
