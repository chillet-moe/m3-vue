import type { App, MaybeRef } from 'vue';
import { buttonContextKey } from '@/components/Button/ButtonContext';
import { iconButtonContextKey } from '@/components/IconButton/IconButtonContext';

export type M3Shape = 'rounded' | 'square';

export type M3ShapeOptions = {
  /** Default shape for action components that consume ButtonContext or IconButtonContext. */
  shape?: MaybeRef<M3Shape>;
};

/** Installs one application-level shape default for both button contexts. */
export function installM3Shape(app: App, options: M3ShapeOptions = {}): void {
  if (options.shape === undefined) {
    return;
  }

  const context = { shape: options.shape };
  app.provide(buttonContextKey, context);
  app.provide(iconButtonContextKey, context);
}
