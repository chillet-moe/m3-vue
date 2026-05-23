import type { StyleTokenMeta } from './types';

export const loadingIndicatorStyleTokens = [
  {
    name: '--md-loading-indicator-active-indicator-color',
    description: 'Controls active indicator color.',
    fallback: 'var(--md-color-on-container,var(--md-sys-color-primary))',
    category: 'Color',
  },
  {
    name: '--md-loading-indicator-active-indicator-size',
    description: 'Controls active indicator size.',
    fallback: '--dp(38)',
    category: 'Layout',
  },
  {
    name: '--md-loading-indicator-contained-active-indicator-color',
    description: 'Controls contained active indicator color.',
    fallback: 'var(--md-color-on-container,var(--md-sys-color-on-primary-container))',
    category: 'Color',
  },
  {
    name: '--md-loading-indicator-contained-container-color',
    description: 'Controls contained container color.',
    fallback: 'var(--md-color-container,var(--md-sys-color-primary-container))',
    category: 'Color',
  },
  {
    name: '--md-loading-indicator-container-height',
    description: 'Controls container height.',
    fallback: '--dp(48)',
    category: 'Layout',
  },
  {
    name: '--md-loading-indicator-container-shape',
    description: 'Controls container shape.',
    fallback: 'var(--md-shape-indicator)',
    category: 'Shape',
  },
  {
    name: '--md-loading-indicator-container-width',
    description: 'Controls container width.',
    fallback: '--dp(48)',
    category: 'Layout',
  },
] satisfies StyleTokenMeta[];
