import type { StyleTokenMeta } from './types';

export const dateRangePickerStyleTokens = [
  {
    name: '--md-date-range-picker-docked-container-width',
    description: 'Controls docked container width when two calendars are visible.',
    fallback: '45rem',
    category: 'Layout',
    targets: [{ scope: 'date-range-picker', part: 'root' }],
  },
  {
    name: '--md-date-range-picker-range-container-color',
    description: 'Controls selected range container color.',
    fallback: 'var(--md-sys-color-primary-container)',
    category: 'State',
    targets: [{ scope: 'date-range-picker', part: 'day' }],
  },
  {
    name: '--md-date-range-picker-range-label-text-color',
    description: 'Controls selected range label text color.',
    fallback: 'var(--md-sys-color-on-primary-container)',
    category: 'State',
    targets: [{ scope: 'date-range-picker', part: 'day-label' }],
  },
  {
    name: '--md-date-range-picker-summary-label-text-color',
    description: 'Controls summary label text color.',
    fallback: 'var(--md-sys-color-primary)',
    category: 'Color',
    targets: [{ scope: 'date-range-picker', part: 'prompt' }],
  },
  {
    name: '--md-date-range-picker-summary-value-text-color',
    description: 'Controls summary value text color.',
    fallback: 'var(--md-sys-color-on-surface)',
    category: 'Color',
    targets: [{ scope: 'date-range-picker', part: 'value' }],
  },
] satisfies StyleTokenMeta[];
