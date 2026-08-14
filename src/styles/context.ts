import type { App, MaybeRef } from 'vue';
import { buttonContextKey } from '@/components/Button/ButtonContext';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext';
import { fieldContextKey } from '@/components/TextField/FieldContext';
import { navigationDrawerShapeContextKey } from '@/components/NavigationDrawer/NavigationDrawerContext';

export type M3Shape = 'rounded' | 'square';

export type M3ShapeOptions = {
  /** Default shape for components with a rounded or square shape variant. */
  shape?: MaybeRef<M3Shape>;
};

/** Installs one application-level shape default across all shape-aware component contexts. */
export function installM3Shape(app: App, options: M3ShapeOptions = {}): void {
  if (options.shape === undefined) {
    return;
  }

  const context = { shape: options.shape };
  app.provide(buttonContextKey, context);
  app.provide(iconButtonContextKey, context);
  app.provide(fieldContextKey, context);
  app.provide(navigationDrawerShapeContextKey, context);
}
