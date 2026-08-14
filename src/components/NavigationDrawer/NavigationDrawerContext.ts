import type { InjectionKey, Ref } from 'vue';
import type { NavigationItemContext } from '@/composables/useNavigationItem';

export type NavigationDrawerShape = 'rounded' | 'square';

export type NavigationDrawerContext = NavigationItemContext & {
  iconOnly: Readonly<Ref<boolean>>;
  shape: Readonly<Ref<NavigationDrawerShape>>;
};

export const navigationDrawerContextKey: InjectionKey<NavigationDrawerContext> = Symbol('NavigationDrawerContext');
