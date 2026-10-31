import type { M3ComponentDefaultsOptions } from '../defaults';
import type { M3FieldOptions, M3ShapeOptions } from '../styles/context';

export type M3Preset = {
  name: 'default' | 'compact';
  typography: 'default' | 'compact';
  density: number;
  defaults: M3ComponentDefaultsOptions & M3FieldOptions & M3ShapeOptions;
};
