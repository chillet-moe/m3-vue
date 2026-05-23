import type { StyleTokenMeta } from './types';

export const bottomSheetStyleTokens = [
  {
    name: '--md-bottom-sheet-background-extension',
    description: 'Controls background extension.',
    fallback: '0px',
    category: 'Style',
  },
  {
    name: '--md-bottom-sheet-drag-offset',
    description: 'Controls drag offset.',
    fallback: '0px',
    category: 'Layout',
  },
  {
    name: '--md-bottom-sheet-max-height',
    description: 'Controls max height.',
    fallback: 'calc(100vb - 3rem)',
    category: 'Layout',
  },
  {
    name: '--md-bottom-sheet-translate-offset',
    description: 'Controls translate offset.',
    fallback: '0px',
    category: 'Layout',
  },
  {
    name: '--md-sheet-bottom-docked-container-color',
    description: 'Controls bottom docked container color.',
    fallback: 'var(--md-sys-color-surface-container-low)',
    category: 'Color',
  },
  {
    name: '--md-sheet-bottom-docked-container-shape',
    description: 'Controls bottom docked container shape.',
    fallback: 'var(--md-shape-overlay-top)',
    category: 'Shape',
  },
  {
    name: '--md-sheet-bottom-docked-drag-handle-color',
    description: 'Controls bottom docked drag handle color.',
    fallback: 'var(--md-sys-color-on-surface-variant)',
    category: 'Color',
  },
  {
    name: '--md-sheet-bottom-docked-drag-handle-height',
    description: 'Controls bottom docked drag handle height.',
    fallback: '0.25rem',
    category: 'Layout',
  },
  {
    name: '--md-sheet-bottom-docked-drag-handle-width',
    description: 'Controls bottom docked drag handle width.',
    fallback: '2rem',
    category: 'Layout',
  },
  {
    name: '--md-sheet-bottom-docked-minimized-container-shape',
    description: 'Controls bottom docked minimized container shape.',
    fallback: 'var(--md-shape-docked)',
    category: 'Shape',
  },
  {
    name: '--md-sheet-bottom-docked-modal-container-elevation',
    description: 'Controls bottom docked modal container elevation.',
    fallback: 'var(--md-sys-elevation-level1)',
    category: 'Elevation',
  },
  {
    name: '--md-sheet-bottom-docked-standard-container-elevation',
    description: 'Controls bottom docked standard container elevation.',
    fallback: 'var(--md-sys-elevation-level1)',
    category: 'Elevation',
  },
  {
    name: '--md-sheet-bottom-focus-indicator-color',
    description: 'Controls bottom focus indicator color.',
    fallback: 'var(--md-sys-color-secondary)',
    category: 'Focus',
  },
  {
    name: '--md-sheet-bottom-focus-indicator-outline-offset',
    description: 'Controls bottom focus indicator outline offset.',
    fallback: 'var(--md-sys-state-focus-indicator-outer-offset)',
    category: 'Focus',
  },
  {
    name: '--md-sheet-bottom-focus-indicator-thickness',
    description: 'Controls bottom focus indicator thickness.',
    fallback: 'var(--md-sys-state-focus-indicator-thickness)',
    category: 'Focus',
  },
] satisfies StyleTokenMeta[];
