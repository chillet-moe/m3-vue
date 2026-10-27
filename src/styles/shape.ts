import { computed, inject, provide, toValue, type InjectionKey, type MaybeRefOrGetter } from 'vue';

export type M3Shape = 'rounded' | 'square' | 'minimal' | 'sharp';
export const shapeContextKey: InjectionKey<MaybeRefOrGetter<M3Shape | undefined>> = Symbol('M3Shape');

/** Resolves a component preference before the nearest shared shape default. */
export function useShape(shape: MaybeRefOrGetter<M3Shape | undefined>, fallback: M3Shape = 'rounded') {
  const inherited = inject(shapeContextKey, undefined);
  return computed(() => toValue(shape) ?? toValue(inherited) ?? fallback);
}

/** Sets a reactive shape default for one component subtree. */
export function provideShape(shape: MaybeRefOrGetter<M3Shape | undefined>) {
  const inherited = inject(shapeContextKey, undefined);
  // Preserve undefined so descendants retain their own defaults (for example, square fields).
  const resolved = computed(() => toValue(shape) ?? toValue(inherited));
  provide(shapeContextKey, resolved);
  return resolved;
}
