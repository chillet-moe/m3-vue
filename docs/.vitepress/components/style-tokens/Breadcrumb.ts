import type { StyleTokenMeta } from './types';

export const breadcrumbStyleTokens = [
  {
    name: '--md-breadcrumb-current-page-color',
    description: 'Controls current page text color.',
    fallback: 'var(--md-color-on-container, var(--md-sys-color-on-surface))',
    category: 'Color',
  },
  {
    name: '--md-breadcrumb-ellipsis-color',
    description: 'Controls ellipsis color.',
    fallback: 'var(--md-color-on-container, var(--md-sys-color-on-surface-variant))',
    category: 'Color',
  },
  {
    name: '--md-breadcrumb-item-height',
    description: 'Controls item height.',
    fallback: '--dp(32)',
    category: 'Layout',
  },
  {
    name: '--md-breadcrumb-item-space',
    description: 'Controls space between items.',
    fallback: '--dp(4)',
    category: 'Layout',
  },
  {
    name: '--md-breadcrumb-link-color',
    description: 'Controls link text color.',
    fallback: 'var(--md-color-on-container, var(--md-sys-color-primary))',
    category: 'Color',
  },
  {
    name: '--md-breadcrumb-link-padding-inline',
    description: 'Controls link inline padding.',
    fallback: '--dp(8)',
    category: 'Layout',
  },
  {
    name: '--md-breadcrumb-link-shape',
    description: 'Controls link shape.',
    fallback: 'var(--md-shape-action)',
    category: 'Shape',
  },
  {
    name: '--md-breadcrumb-separator-color',
    description: 'Controls separator color.',
    fallback: 'var(--md-color-on-container, var(--md-sys-color-on-surface-variant))',
    category: 'Color',
  },
  {
    name: '--md-breadcrumb-separator-icon-size',
    description: 'Controls separator and ellipsis icon size.',
    fallback: '--dp(18)',
    category: 'Layout',
  },
  {
    name: '--md-breadcrumb-state-layer-color',
    description: 'Controls link state layer color.',
    fallback: 'var(--md-state-layer-color, var(--md-breadcrumb-link-color))',
    category: 'Color',
  },
] satisfies StyleTokenMeta[];
