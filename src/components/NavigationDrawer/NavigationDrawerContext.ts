import type { ComputedRef, InjectionKey, Ref } from 'vue';

export type NavigationDrawerContext = {
  value: ComputedRef<string | undefined>;
  disabled: Ref<boolean>;
  activate: (value: string) => void;
};

export const navigationDrawerContextKey: InjectionKey<NavigationDrawerContext> = Symbol('NavigationDrawerContext');
