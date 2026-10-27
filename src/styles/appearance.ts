import { computed, inject, provide, unref, type InjectionKey, type MaybeRef } from 'vue';

export type M3Appearance = 'standard' | 'expressive';
export interface M3AppearanceContext {
  appearance?: MaybeRef<M3Appearance | undefined>;
}

/** Shared visual preference for Select/Combobox, ListItem, and Slider. */
export const appearanceContextKey: InjectionKey<M3AppearanceContext> = Symbol('M3AppearanceContext');

export function provideAppearanceDefaults(defaults: M3AppearanceContext): M3AppearanceContext {
  const inherited = inject(appearanceContextKey, undefined);
  const context = {
    appearance: computed(() => unref(defaults.appearance) ?? unref(inherited?.appearance)),
  };
  provide(appearanceContextKey, context);
  return context;
}
