import type { ComputedRef, InjectionKey, Ref } from 'vue';

export interface NavigationRailContext {
  value: ComputedRef<string | undefined>;
  state: ComputedRef<'collapsed' | 'expanded'>;
  disabled: Readonly<Ref<boolean>>;
  activate: (value: string) => void;
}

export const navigationRailContextKey: InjectionKey<NavigationRailContext> = Symbol('NavigationRailContext');
