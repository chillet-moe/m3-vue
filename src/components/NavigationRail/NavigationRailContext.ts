import type { ComputedRef, InjectionKey } from 'vue';
import type { NavigationItemContext } from '@/composables/useNavigationItem';

export type NavigationRailContext = NavigationItemContext & {
  state: ComputedRef<'collapsed' | 'expanded'>;
};

export const navigationRailContextKey: InjectionKey<NavigationRailContext> = Symbol('NavigationRailContext');
