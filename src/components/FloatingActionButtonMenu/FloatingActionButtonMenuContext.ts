import type { InjectionKey } from 'vue';

export type FloatingActionButtonMenuContext = {
  id: string;
};

export const floatingActionButtonMenuContextKey = Symbol(
  'floatingActionButtonMenu',
) as InjectionKey<FloatingActionButtonMenuContext>;
