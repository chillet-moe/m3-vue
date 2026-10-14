import type { App, MaybeRef } from 'vue';
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
export function installM3StyleDefaults(app: App, options: M3ShapeOptions & M3FieldOptions = {}): void {
  const context: FieldContext = {};
  if (options.shape !== undefined) context.shape = options.shape;
  if (options.fieldSize !== undefined) context.size = options.fieldSize;
  if (options.shape !== undefined || options.fieldSize !== undefined) {
    app.provide(fieldContextKey, context);
  }

  if (options.shape === undefined) {
    return;
  }

  const shapeContext = { shape: options.shape };
  app.provide(buttonContextKey, shapeContext);
  app.provide(iconButtonContextKey, shapeContext);
  app.provide(navigationDrawerShapeContextKey, shapeContext);
}
