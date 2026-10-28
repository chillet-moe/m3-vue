import { computed, inject, provide, unref, type InjectionKey, type MaybeRef } from 'vue';

/** Presentation defaults for descendant Select and Combobox components. */
export interface SelectContext {
  showSelectedIcon?: MaybeRef<boolean | undefined>;
}

export const selectContextKey: InjectionKey<SelectContext> = Symbol('SelectContext');

/** Merge preferences with the enclosing provider; undefined inherits. */
export function provideSelectDefaults(defaults: SelectContext): SelectContext {
  const inherited = inject(selectContextKey, undefined);
  const context: SelectContext = {
    showSelectedIcon: computed(() => unref(defaults.showSelectedIcon) ?? unref(inherited?.showSelectedIcon)),
  };
  provide(selectContextKey, context);
  return context;
}
