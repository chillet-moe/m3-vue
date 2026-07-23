import type { InjectionKey, Ref } from 'vue';
import type { NavigationItemContext } from '@/composables/useNavigationItem';

export type NavigationDrawerContext = NavigationItemContext & {
  iconOnly: Readonly<Ref<boolean>>;
};

export const navigationDrawerContextKey: InjectionKey<NavigationDrawerContext> = Symbol('NavigationDrawerContext');
