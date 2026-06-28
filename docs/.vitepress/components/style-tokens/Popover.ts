import type { StyleTokenMeta } from './types';

export const popoverStyleTokens = [
  {
    name: '--md-popover-container-color',
    description: 'Controls popover container color.',
    fallback: 'var(--md-sys-color-surface-container)',
    category: 'Color',
    targets: [{ scope: 'popover', part: 'surface' }],
  },
  {
    name: '--md-popover-container-elevation',
    description: 'Controls popover container elevation.',
    fallback: 'var(--md-sys-elevation-level2)',
    category: 'Elevation',
    targets: [{ scope: 'popover', part: 'surface' }],
  },
  {
    name: '--md-popover-container-shape',
    description: 'Controls popover container shape.',
    fallback: 'var(--md-shape-popover)',
    category: 'Shape',
    targets: [{ scope: 'popover', part: 'surface' }],
  },
  {
    name: '--md-popover-max-height',
    description: 'Controls popover maximum height.',
    fallback: '32rem',
    category: 'Layout',
    targets: [{ scope: 'popover', part: 'root' }],
  },
  {
    name: '--md-popover-max-width',
    description: 'Controls popover maximum width.',
    fallback: '28rem',
    category: 'Layout',
    targets: [{ scope: 'popover', part: 'root' }],
  },
  {
    name: '--md-popover-min-width',
    description: 'Controls popover minimum width.',
    fallback: '0rem',
    category: 'Layout',
    targets: [{ scope: 'popover', part: 'root' }],
  },
  {
    name: '--md-popover-on-container-color',
    description: 'Controls popover content color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Color',
    targets: [{ scope: 'popover', part: 'surface' }],
  },
  {
    name: '--md-popover-padding',
    description: 'Controls popover content padding.',
    fallback: '1rem',
    category: 'Layout',
    targets: [{ scope: 'popover', part: 'surface' }],
  },
] satisfies StyleTokenMeta[];
