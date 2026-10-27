type ShapeRoleKey =
  | 'action'
  | 'field'
  | 'fieldSquare'
  | 'chip'
  | 'card'
  | 'popover'
  | 'compact'
  | 'overlay'
  | 'indicator'
  | 'fab';

type ShapeRole = {
  full?: boolean;
  key: ShapeRoleKey;
  max: number;
  min: number;
  token: string;
};

export const shapeRoles: ShapeRole[] = [
  {
    key: 'action',
    token: '--md-shape-action',
    min: 0,
    max: 32,
  },
  {
    key: 'field',
    token: '--md-shape-field',
    min: 0,
    max: 32,
  },
  {
    key: 'fieldSquare',
    token: '--md-shape-field-square',
    min: 0,
    max: 32,
  },
  {
    key: 'chip',
    token: '--md-shape-chip',
    min: 0,
    max: 28,
  },
  {
    key: 'card',
    token: '--md-shape-card',
    min: 0,
    max: 32,
  },
  {
    key: 'popover',
    token: '--md-shape-popover',
    min: 0,
    max: 32,
  },
  {
    key: 'compact',
    token: '--md-shape-compact',
    min: 0,
    max: 20,
  },
  {
    key: 'overlay',
    token: '--md-shape-overlay',
    min: 0,
    max: 40,
  },
  {
    key: 'indicator',
    token: '--md-shape-indicator',
    min: 0,
    max: 32,
    full: true,
  },
  {
    key: 'fab',
    token: '--md-shape-fab',
    min: 0,
    max: 32,
  },
];
