import type { StyleTokenMeta } from './types';

export const dividerStyleTokens = [
  {
    name: '--md-divider-color',
    description: 'Controls color.',
    fallback: 'var(--md-sys-color-outline-variant)',
    category: 'Color',
  },
  {
    name: '--md-divider-inset',
    description: 'Controls inset.',
    fallback: '--dp(16)',
    category: 'Layout',
  },
  {
    name: '--md-divider-spacing',
    description: 'Controls spacing.',
    fallback: '0',
    category: 'Style',
  },
  {
    name: '--md-divider-thickness',
    description: 'Controls thickness.',
    fallback: '0.0625rem',
    category: 'Layout',
  },
] satisfies StyleTokenMeta[];
