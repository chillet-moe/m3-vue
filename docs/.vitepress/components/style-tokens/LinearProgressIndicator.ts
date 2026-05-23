import type { StyleTokenMeta } from './types';

export const linearProgressIndicatorStyleTokens = [
  {
    name: '--md-progress-indicator-color',
    description: 'Shared active indicator color for progress indicators.',
    fallback: 'var(--md-color-on-container, var(--md-sys-color-primary))',
    category: 'Color',
  },
  {
    name: '--md-progress-indicator-track-color',
    description: 'Shared track color for progress indicators.',
    fallback: 'var(--md-color-container, var(--md-sys-color-secondary-container))',
    category: 'Color',
  },
  {
    name: '--md-progress-indicator-stop-indicator-color',
    description: 'Shared stop indicator color for linear progress.',
    fallback: 'var(--md-progress-indicator-color)',
    category: 'Color',
  },
  {
    name: '--md-linear-progress-indicator-active-indicator-color',
    description: 'Active segment color for the linear indicator.',
    fallback: 'var(--md-progress-indicator-color)',
    category: 'Color',
  },
  {
    name: '--md-linear-progress-indicator-track-color',
    description: 'Track color for the linear indicator.',
    fallback: 'var(--md-progress-indicator-track-color)',
    category: 'Color',
  },
  {
    name: '--md-linear-progress-indicator-stop-indicator-color',
    description: 'Stop indicator color for determinate linear progress.',
    fallback: 'var(--md-progress-indicator-stop-indicator-color)',
    category: 'Color',
  },
  {
    name: '--md-linear-progress-indicator-track-thickness',
    description: 'Height of the track and active segment.',
    fallback: '--dp(4)',
    category: 'Layout',
  },
  {
    name: '--md-linear-progress-indicator-track-active-indicator-gap',
    description: 'Gap between active segment and track in determinate partial state.',
    fallback: '--dp(4)',
    category: 'Layout',
  },
  {
    name: '--md-linear-progress-indicator-stop-indicator-size',
    description: 'Size of the stop indicator dot.',
    fallback: '--dp(4)',
    category: 'Layout',
  },
  {
    name: '--md-linear-progress-indicator-shape',
    description: 'Corner radius for track, active segment, and stop indicator.',
    fallback: 'var(--md-shape-indicator)',
    category: 'Shape',
  },
  {
    name: '--md-linear-progress-indicator-wave-amplitude',
    description: 'Amplitude for the wavy active segment.',
    fallback: '--dp(3)',
    category: 'Wave',
  },
  {
    name: '--md-linear-progress-indicator-wave-wavelength',
    description: 'Wavelength for determinate wavy progress.',
    fallback: '--dp(40)',
    category: 'Wave',
  },
  {
    name: '--md-linear-progress-indicator-indeterminate-wave-wavelength',
    description: 'Wavelength for indeterminate wavy progress.',
    fallback: '--dp(20)',
    category: 'Wave',
  },
  {
    name: '--md-linear-progress-indicator-with-wave-height',
    description: 'Minimum height when using the wavy shape.',
    fallback: '--dp(10)',
    category: 'Wave',
  },
] satisfies StyleTokenMeta[];
