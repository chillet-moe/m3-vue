import type { M3Shape } from '@/styles/shape';
import type { InjectionKey, MaybeRef, Ref } from 'vue';
import type { NavigationItemContext } from '@/composables/useNavigationItem';

export type NavigationDrawerShape = M3Shape;

export type NavigationDrawerContext = NavigationItemContext & {
  iconOnly: Readonly<Ref<boolean>>;
  shape: Readonly<Ref<NavigationDrawerShape>>;
};

export const navigationDrawerContextKey: InjectionKey<NavigationDrawerContext> = Symbol('NavigationDrawerContext');

export type NavigationDrawerShapeContext = {
  shape?: MaybeRef<NavigationDrawerShape>;
};

export const navigationDrawerShapeContextKey: InjectionKey<NavigationDrawerShapeContext> =
  Symbol('NavigationDrawerShapeContext');
