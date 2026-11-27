import type { AnatomyPart } from './component-anatomy';

// Parts rendered via dynamic bindings or render functions. The plugin extracts
// the remaining parts directly from their templates.
const calendarNavigation = [
  { part: 'header', element: 'div', conditional: false },
  { part: 'previous-month', element: 'IconButton', conditional: false },
  { part: 'month-switch', element: 'Button', conditional: false },
  { part: 'next-month', element: 'IconButton', conditional: false },
  { part: 'previous-year', element: 'IconButton', conditional: false },
  { part: 'year-switch', element: 'Button', conditional: false },
  { part: 'next-year', element: 'IconButton', conditional: false },
  { part: 'months', element: 'div', conditional: true },
  { part: 'month', element: 'button', conditional: true },
  { part: 'years', element: 'div', conditional: true },
  { part: 'year', element: 'button', conditional: true },
  { part: 'list-icon', element: 'span', conditional: true },
  { part: 'list-label', element: 'span', conditional: true },
];

export const additionalAnatomyParts = {
  'number-field': [
    { part: 'increment', element: 'IconButton', conditional: false },
    { part: 'decrement', element: 'IconButton', conditional: false },
  ],
  'date-picker': calendarNavigation,
  'date-range-picker': calendarNavigation,
  'time-picker': [
    { part: 'display', element: 'div', conditional: true },
    { part: 'inputs', element: 'div', conditional: true },
  ],
  pagination: ['previous', 'next'].flatMap((direction) => [
    { part: direction, element: 'PaginationLink', conditional: false },
    { part: `${direction}-text`, element: 'span', conditional: false },
    { part: `${direction}-icon`, element: 'Icon', conditional: false },
  ]),
} satisfies Record<string, Omit<AnatomyPart, 'children'>[]>;
