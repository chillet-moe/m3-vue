import { computed, inject, provide, toValue, type InjectionKey, type MaybeRefOrGetter } from 'vue';

export type RowSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

export const rowSizeContextKey: InjectionKey<MaybeRefOrGetter<RowSize | undefined>> = Symbol('RowSize');

/** Sets a reactive row size for descendants; an omitted value inherits the nearest size. */
export function provideRowSize(size: MaybeRefOrGetter<RowSize | undefined>) {
  const inherited = inject(rowSizeContextKey, undefined);
  const resolved = computed(() => toValue(size) ?? toValue(inherited) ?? 'medium');
  provide(rowSizeContextKey, resolved);
  return resolved;
}
