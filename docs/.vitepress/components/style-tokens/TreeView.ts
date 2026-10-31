import type { StyleTokenMeta } from './types';

export const treeViewStyleTokens = [
  {
    name: '--md-tree-row-height',
    description: 'Minimum row height.',
    fallback: '48 dp at density 0; 32 dp at density -4',
    category: 'Size',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-indent',
    description: 'Indentation for each nested level.',
    fallback: '16 dp',
    category: 'Spacing',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-padding-inline',
    description: 'Padding at each row edge.',
    fallback: '8 dp',
    category: 'Spacing',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-gap',
    description: 'Space between row contents.',
    fallback: '6 dp',
    category: 'Spacing',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-shape',
    description: 'Row corner shape.',
    fallback: 'var(--md-shape-compact)',
    category: 'Shape',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-container-color',
    description: 'Tree background.',
    fallback: 'var(--md-color-container, transparent)',
    category: 'Color',
    targets: [
      {
        scope: 'tree-view',
        part: 'root',
      },
    ],
  },
  {
    name: '--md-tree-label-color',
    description: 'Unselected row content color.',
    fallback: 'var(--md-color-on-container, var(--md-sys-color-on-surface))',
    category: 'Color',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-selected-container-color',
    description: 'Selected row background.',
    fallback: 'var(--md-sys-color-secondary-container)',
    category: 'Color',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-selected-label-color',
    description: 'Selected row content and state layer color.',
    fallback: 'var(--md-sys-color-on-secondary-container)',
    category: 'Color',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
  {
    name: '--md-tree-icon-size',
    description: 'Leading icon and disclosure size.',
    fallback: 'Typography, density and icon scale (default reference: 18 dp)',
    category: 'Size',
    targets: [
      {
        scope: 'tree-item',
        part: 'row',
      },
    ],
  },
] satisfies StyleTokenMeta[];
