import { rowSizeContextKey } from './rowSize';
import { appearanceContextKey } from './appearance';
import type { App, MaybeRef } from 'vue';
import type { M3ComponentDefaultsOptions } from '@/defaults';
import { listItemContextKey } from '@/components/ListItem/ListItemContext';
import { sliderContextKey } from '@/components/Slider/SliderContext';
import { menuDefaultsContextKey } from '@/components/Menu/MenuDefaultsContext';
import { buttonContextKey } from '@/components/Button/ButtonContext';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext';
import type { FieldContext } from '@/components/TextField/FieldContext';
import { fieldContextKey } from '@/components/TextField/FieldContext';
import { shapeContextKey, type M3Shape } from './shape';

export type M3ShapeOptions = {
  /** Default shape for shape-aware components. */
  shape?: MaybeRef<M3Shape>;
};

export type M3FieldOptions = {
  /** Default size for single-line TextField and Select controls. Accepts a reactive ref. */
  fieldSize?: FieldContext['size'];
};

/** Installs appearance defaults, providing each context once so shape and size coexist. */
export function installM3StyleDefaults(
  app: App,
  options: M3ShapeOptions & M3FieldOptions & M3ComponentDefaultsOptions = {},
): void {
  if (options.rowSize !== undefined) app.provide(rowSizeContextKey, options.rowSize);
  if (options.appearance !== undefined) app.provide(appearanceContextKey, { appearance: options.appearance });
  if (options.shape !== undefined) app.provide(shapeContextKey, options.shape);
  if (options.fieldSize !== undefined) {
    app.provide(fieldContextKey, { size: options.fieldSize });
  }

  if (options.buttonDefaults !== undefined) {
    app.provide(buttonContextKey, options.buttonDefaults);
  }
  if (options.iconButtonSize !== undefined) {
    app.provide(iconButtonContextKey, { size: options.iconButtonSize });
  }
  if (options.sliderDefaults !== undefined) {
    app.provide(sliderContextKey, options.sliderDefaults);
  }
  if (options.listItemDefaults !== undefined) app.provide(listItemContextKey, options.listItemDefaults);
  if (options.menuColor !== undefined) app.provide(menuDefaultsContextKey, { color: options.menuColor });
}
