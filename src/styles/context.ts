import type { App, MaybeRef } from 'vue';
import type { M3ComponentDefaultsOptions } from '@/defaults';
import { sliderContextKey } from '@/components/Slider/SliderContext';
import { menuDefaultsContextKey } from '@/components/Menu/MenuDefaultsContext';
import { buttonContextKey } from '@/components/Button/ButtonContext';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext';
import type { FieldContext } from '@/components/TextField/FieldContext';
import { fieldContextKey } from '@/components/TextField/FieldContext';
import { navigationDrawerShapeContextKey } from '@/components/NavigationDrawer/NavigationDrawerContext';

export type M3Shape = 'rounded' | 'square';

export type M3ShapeOptions = {
  /** Default shape for components with a rounded or square shape variant. */
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
  const context: FieldContext = {};
  if (options.shape !== undefined) context.shape = options.shape;
  if (options.fieldSize !== undefined) context.size = options.fieldSize;
  if (options.shape !== undefined || options.fieldSize !== undefined) {
    app.provide(fieldContextKey, context);
  }

  if (options.shape !== undefined || options.buttonSize !== undefined) {
    app.provide(buttonContextKey, { shape: options.shape, size: options.buttonSize });
  }
  if (options.shape !== undefined || options.iconButtonSize !== undefined) {
    app.provide(iconButtonContextKey, { shape: options.shape, size: options.iconButtonSize });
  }
  if (options.shape !== undefined) app.provide(navigationDrawerShapeContextKey, { shape: options.shape });
  if (options.sliderSize !== undefined) app.provide(sliderContextKey, { size: options.sliderSize });
  if (options.menuColor !== undefined) app.provide(menuDefaultsContextKey, { color: options.menuColor });
}
