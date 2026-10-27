import { computed, inject, provide, unref, type InjectionKey, type MaybeRef } from 'vue';
import type { ListItemProps } from './ListItem.vue';

export interface ListItemContext {
  size?: MaybeRef<ListItemProps['size']>;
  appearance?: MaybeRef<ListItemProps['appearance']>;
}

export const listItemContextKey: InjectionKey<ListItemContext> = Symbol('ListItemContext');

export function provideListItemDefaults(defaults: ListItemContext): ListItemContext {
  const inherited = inject(listItemContextKey, undefined);
  const context: ListItemContext = {
    size: computed(() => unref(defaults.size) ?? unref(inherited?.size)),
    appearance: computed(() => unref(defaults.appearance) ?? unref(inherited?.appearance)),
  };
  provide(listItemContextKey, context);
  return context;
}
