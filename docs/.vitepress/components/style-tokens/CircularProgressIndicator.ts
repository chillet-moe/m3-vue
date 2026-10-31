import type { StyleTokenMeta } from './types';

export const circularProgressIndicatorStyleTokens = [
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
    name: '--md-circular-progress-indicator-active-indicator-color',
    description: 'Active arc color for the circular indicator.',
    fallback: 'var(--md-progress-indicator-color)',
    category: 'Color',
  },
  {
    name: '--md-circular-progress-indicator-track-color',
    description: 'Track arc color for the circular indicator.',
    fallback: 'var(--md-progress-indicator-track-color)',
    category: 'Color',
  },
  {
    name: '--md-circular-progress-indicator-size',
    description: 'Default size for the circular indicator.',
    fallback: '40dp × typography/density scale',
    category: 'Layout',
  },
  {
    name: '--md-circular-progress-indicator-with-wave-size',
    description: 'Default size when using the wavy shape.',
    fallback: '48dp × typography/density scale',
    category: 'Layout',
  },
  {
    name: '--md-circular-progress-indicator-track-thickness',
    description: 'Stroke thickness for track and active arcs.',
    fallback: '4dp × typography/density scale',
    category: 'Layout',
  },
  {
    name: '--md-circular-progress-indicator-track-active-indicator-gap',
    description: 'Gap between active arc and track arc.',
    fallback: '4dp × typography/density scale',
    category: 'Layout',
  },
  {
    name: '--md-circular-progress-indicator-wave-amplitude',
    description: 'Amplitude for the wavy active arc.',
    fallback: '1.6dp × typography/density scale',
    category: 'Wave',
  },
  {
    name: '--md-circular-progress-indicator-wave-wavelength',
    description: 'Wavelength for the wavy active arc.',
    fallback: '15dp × typography/density scale',
    category: 'Wave',
  },
] satisfies StyleTokenMeta[];
