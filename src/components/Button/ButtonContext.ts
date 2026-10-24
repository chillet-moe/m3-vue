import { computed, inject, provide, unref, type InjectionKey, type MaybeRef } from 'vue';
import type { ButtonProps } from '@/components/Button/Button.vue';

export interface ButtonContext {
  toggleable?: MaybeRef<ButtonProps['toggleable'] | undefined>;
  size?: MaybeRef<ButtonProps['size'] | undefined>;
  variant?: MaybeRef<ButtonProps['variant'] | undefined>;
  shape?: MaybeRef<ButtonProps['shape'] | undefined>;
  pressShapeMorph?: MaybeRef<ButtonProps['pressShapeMorph'] | undefined>;
  disabled?: MaybeRef<boolean | undefined>;
}

export const buttonContextKey: InjectionKey<ButtonContext> = Symbol('ButtonContext');

/** Application/subtree preferences, excluding action semantics and state. */
export type ButtonDefaults = Pick<ButtonContext, 'size' | 'pressShapeMorph'>;

export function provideButtonDefaults(defaults: ButtonDefaults): ButtonContext {
  const inherited = inject(buttonContextKey, undefined);
  const context: ButtonContext = {
    ...inherited,
    size: computed(() => unref(defaults.size) ?? unref(inherited?.size)),
    pressShapeMorph: computed(() => unref(defaults.pressShapeMorph) ?? unref(inherited?.pressShapeMorph)),
  };
  provide(buttonContextKey, context);
  return context;
}
