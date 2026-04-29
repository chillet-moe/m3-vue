import type { StyleTokenMeta } from './types';

export const paginationStyleTokens = [
  {
    name: '--md-pagination-ellipsis-color',
    description: 'Controls ellipsis color.',
    fallback: 'var(--md-sys-color-on-surface-variant)',
    category: 'Color',
  },
  {
    name: '--md-pagination-ellipsis-size',
    description: 'Controls ellipsis size.',
    fallback: '--dp(40)',
    category: 'Layout',
  },
  {
    name: '--md-pagination-item-space',
    description: 'Controls item space.',
    fallback: '--dp(4)',
    category: 'Layout',
  },
  {
    name: '--md-pagination-link-min-width',
    description: 'Controls link min width.',
    fallback: '--dp(40)',
    category: 'Layout',
  },
  {
    name: '--md-pagination-link-padding-inline',
    description: 'Controls link padding inline.',
    fallback: '--dp(12)',
    category: 'Layout',
  },
  {
    name: '--md-pagination-nav-icon-size',
    description: 'Controls nav icon size.',
    fallback: '--dp(20)',
    category: 'Layout',
  },
  {
    name: '--md-pagination-nav-inline-space',
    description: 'Controls nav inline space.',
    fallback: '--dp(4)',
    category: 'Layout',
  },
] satisfies StyleTokenMeta[];
