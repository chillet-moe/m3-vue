import type { StyleTokenMeta } from './types';

export const listGroupingStyleTokens = [
  {
    name: '--md-list-group-item-first-child-shape',
    description: 'Controls the block-start corner radius of the first direct rounded participant.',
    fallback: '--dp(24)',
    category: 'Shape',
    targets: [{ scope: 'list', part: 'container' }],
  },
  {
    name: '--md-list-group-item-last-child-shape',
    description: 'Controls the block-end corner radius of the last direct rounded participant.',
    fallback: '--dp(24)',
    category: 'Shape',
    targets: [{ scope: 'list', part: 'container' }],
  },
  {
    name: '--md-list-group-item-shape',
    description: 'Controls the base corner radius of direct grouping participants.',
    fallback: 'rounded: var(--md-sys-shape-corner-small); square: var(--md-shape-compact)',
    category: 'Shape',
    targets: [{ scope: 'list', part: 'container' }],
  },
] satisfies StyleTokenMeta[];
