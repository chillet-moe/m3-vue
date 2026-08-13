import type { StyleTokenMeta } from './types';

export const iconStyleTokens = [
  {
    name: '--md-icon-size',
    description: 'Controls the icon size. Standalone icons default to 1.5rem; inline icons default to 1em.',
    fallback: '1.5rem',
    category: 'Layout',
  },
] satisfies StyleTokenMeta[];
