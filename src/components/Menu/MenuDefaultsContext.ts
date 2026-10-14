import type { InjectionKey, MaybeRef } from 'vue';
import type { MenuProps } from './Menu.vue';

/** Appearance or interaction defaults for descendant Menu components. */
export interface MenuDefaultsContext {
  color?: MaybeRef<MenuProps['color']>;
}

export const menuDefaultsContextKey: InjectionKey<MenuDefaultsContext> = Symbol('MenuDefaultsContext');
