import type { StyleTokenMeta } from './types';

export const inputOtpStyleTokens = [
  {
    name: '--md-input-otp-caret-color',
    description: 'Controls caret color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'Color',
  },
  {
    name: '--md-input-otp-container-shape',
    description: 'Controls container shape.',
    fallback: 'var(--md-shape-field-square)',
    category: 'Shape',
  },
  {
    name: '--md-input-otp-disabled-opacity',
    description: 'Controls disabled opacity.',
    fallback: '0.38',
    category: 'Disabled',
  },
  {
    name: '--md-input-otp-error-caret-color',
    description: 'Controls error caret color.',
    fallback: 'var(--md-sys-color-error)',
    category: 'Color',
  },
  {
    name: '--md-input-otp-error-outline-color',
    description: 'Controls error outline color.',
    fallback: 'var(--md-sys-color-error)',
    category: 'Color',
  },
  {
    name: '--md-input-otp-focus-outline-color',
    description: 'Controls focus outline color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'Focus',
  },
  {
    name: '--md-input-otp-focus-outline-width',
    description: 'Controls focus outline width.',
    fallback: '0.1875rem',
    category: 'Focus',
  },
  {
    name: '--md-input-otp-hover-outline-color',
    description: 'Controls hover outline color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'State',
  },
  {
    name: '--md-input-otp-input-text-color',
    description: 'Controls input text color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Color',
  },
  {
    name: '--md-input-otp-input-text-font',
    description: 'Controls input text font.',
    fallback: 'var(--md-sys-typescale-title-medium-font)',
    category: 'Typography',
  },
  {
    name: '--md-input-otp-input-text-line-height',
    description: 'Controls input text line height.',
    fallback: 'var(--md-sys-typescale-title-medium-line-height)',
    category: 'Typography',
  },
  {
    name: '--md-input-otp-input-text-size',
    description: 'Controls input text size.',
    fallback: 'var(--md-sys-typescale-title-medium-size)',
    category: 'Layout',
  },
  {
    name: '--md-input-otp-input-text-weight',
    description: 'Controls input text weight.',
    fallback: 'var(--md-sys-typescale-title-medium-weight)',
    category: 'Typography',
  },
  {
    name: '--md-input-otp-large-container-size',
    description: 'Controls large container size.',
    fallback: '3.5rem',
    category: 'Layout',
  },
  {
    name: '--md-input-otp-medium-container-size',
    description: 'Controls medium container size.',
    fallback: '3rem',
    category: 'Layout',
  },
  {
    name: '--md-input-otp-outline-color',
    description: 'Controls outline color.',
    fallback: 'var(--md-sys-color-outline)',
    category: 'Color',
  },
  {
    name: '--md-input-otp-outline-width',
    description: 'Controls outline width.',
    fallback: '0.0625rem',
    category: 'Layout',
  },
  {
    name: '--md-input-otp-small-container-size',
    description: 'Controls small container size.',
    fallback: '2.5rem',
    category: 'Layout',
  },
] satisfies StyleTokenMeta[];
