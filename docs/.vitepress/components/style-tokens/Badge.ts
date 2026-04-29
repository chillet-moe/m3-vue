import type { StyleTokenMeta } from './types';

export const badgeStyleTokens = [
  {
    name: '--md-badge-container-shape',
    description: 'Controls container shape.',
    fallback: 'var(--md-badge-shape,var(--md-sys-shape-corner-full))',
    category: 'Shape',
  },
  {
    name: '--md-badge-container-size',
    description: 'Controls container size.',
    fallback: 'var(--md-badge-size,--dp(6))',
    category: 'Layout',
  },
  {
    name: '--md-badge-large-label-inline-padding',
    description: 'Controls large label inline padding.',
    fallback: '--dp(4)',
    category: 'Layout',
  },
  {
    name: '--md-badge-large-shape',
    description: 'Controls large shape.',
    fallback: 'var(--md-sys-shape-corner-full)',
    category: 'Shape',
  },
  {
    name: '--md-badge-large-size',
    description: 'Controls large size.',
    fallback: '--dp(16)',
    category: 'Layout',
  },
  {
    name: '--md-badge-shape',
    description: 'Controls shape.',
    fallback: 'var(--md-sys-shape-corner-full)',
    category: 'Shape',
  },
  {
    name: '--md-badge-size',
    description: 'Controls size.',
    fallback: '--dp(6)',
    category: 'Layout',
  },
] satisfies StyleTokenMeta[];
