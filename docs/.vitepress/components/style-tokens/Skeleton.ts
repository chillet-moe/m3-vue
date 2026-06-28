import type { StyleTokenMeta } from './types';

export const skeletonStyleTokens = [
  {
    name: '--md-skeleton-animation-duration',
    description: 'Controls animation duration.',
    fallback: '1.4s',
    category: 'Motion',
  },
  {
    name: '--md-skeleton-container-color',
    description: 'Controls placeholder container color.',
    fallback: 'var(--md-color-container,--translucent(var(--md-sys-color-on-surface),0.12))',
    category: 'Color',
  },
  {
    name: '--md-skeleton-highlight-color',
    description: 'Controls wave highlight color.',
    fallback: '--translucent(var(--md-sys-color-on-surface),0.08)',
    category: 'Color',
  },
] satisfies StyleTokenMeta[];
