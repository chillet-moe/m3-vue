import type { StyleTokenMeta } from './types';

export const listItemStyleTokens = [
  {
    name: '--md-item-active-icon-color',
    description: 'Controls active icon color.',
    fallback: 'var(--md-sys-color-on-secondary-container)',
    category: 'Color',
  },
  {
    name: '--md-item-active-indicator-color',
    description: 'Controls active indicator color.',
    fallback: 'var(--md-sys-color-secondary-container)',
    category: 'Color',
  },
  {
    name: '--md-item-active-label-color',
    description: 'Controls active label color.',
    fallback: 'var(--md-sys-color-on-secondary-container)',
    category: 'Color',
  },
  {
    name: '--md-item-active-state-layer-color',
    description: 'Controls active state layer color.',
    fallback: 'var(--md-sys-color-on-secondary-container)',
    category: 'State',
  },
  {
    name: '--md-item-content-gap',
    description: 'Controls content gap.',
    fallback: '--dp(2)',
    category: 'Layout',
  },
  {
    name: '--md-item-footer-color',
    description: 'Controls footer color.',
    fallback: 'var(--md-sys-color-on-surface-variant)',
    category: 'Color',
  },
  {
    name: '--md-item-gap',
    description: 'Controls gap.',
    fallback: '--dp(12)',
    category: 'Layout',
  },
  {
    name: '--md-item-header-color',
    description: 'Controls header color.',
    fallback: 'var(--md-sys-color-on-surface-variant)',
    category: 'Color',
  },
  {
    name: '--md-item-icon-size',
    description: 'Controls icon size.',
    fallback: 'Size, typography, density and icon scale (default medium reference: 24dp)',
    category: 'Layout',
  },
  {
    name: '--md-item-inactive-icon-color',
    description: 'Controls inactive icon color.',
    fallback: 'var(--md-color-on-container)',
    category: 'Color',
  },
  {
    name: '--md-item-inactive-label-color',
    description: 'Controls inactive label color.',
    fallback: 'var(--md-color-on-container)',
    category: 'Color',
  },
  {
    name: '--md-item-inactive-state-layer-color',
    description: 'Controls inactive state layer color.',
    fallback: 'var(--md-color-on-container)',
    category: 'State',
  },
  {
    name: '--md-item-indicator-collapsed-visual-width',
    description: 'Controls indicator collapsed visual width.',
    fallback: '--dp(12)',
    category: 'Layout',
  },
  {
    name: '--md-item-indicator-shape',
    description: 'Controls indicator shape.',
    fallback: 'var(--md-shape-indicator)',
    category: 'Shape',
  },
  {
    name: '--md-item-main-padding-block',
    description: 'Controls main padding block.',
    fallback: '--dp(8)',
    category: 'Layout',
  },
  {
    name: '--md-item-main-padding-inline',
    description: 'Controls main padding inline.',
    fallback: '--dp(12)',
    category: 'Layout',
  },
  {
    name: '--md-item-min-height',
    description: 'Controls min height.',
    fallback: '--dp(56)',
    category: 'Layout',
  },
  {
    name: '--md-item-motion',
    description: 'Controls motion.',
    fallback: 'var(--md-easing-spatial)',
    category: 'Motion',
  },
  {
    name: '--md-item-padding-block',
    description: 'Controls padding block.',
    fallback: '--dp(8)',
    category: 'Layout',
  },
  {
    name: '--md-item-padding-inline',
    description: 'Controls padding inline.',
    fallback: '--dp(8)',
    category: 'Layout',
  },
] satisfies StyleTokenMeta[];
